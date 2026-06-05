import { useState, useEffect, useRef } from "react";
import { UploadCloud, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import CircularProgress from "./CircularProgress";
import { socket } from "../App";
import {
  validateFile,
  formatFileSize,
  ALLOWED_FILE_TYPES,
} from "../utils/fileValidation";

export default function FileTransferArea({
  connectedDevice,
  transactionRoomId,
  transferProgress,
  onTransferProgress,
  onDisconnect,
}) {
  const [maxAllowedSize, setMaxAllowedSize] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState("Ready to transfer");
  const [downloadInfo, setDownloadInfo] = useState(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const incomingChunksRef = useRef([]); //this is help us to not trigger page reload on every chunk recieved
  const incomingSizeRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateProgress = (value) => {
    const normalized = Math.max(0, Math.min(100, Math.round(value)));
    if (onTransferProgress) {
      onTransferProgress(normalized);
    }
  };

  useEffect(() => {
    if (!transactionRoomId) {
      setIsLoading(true);
      setIsTransferring(false);
      setTransferMessage("Ready to transfer");
      setDownloadInfo(null);
      updateProgress(0);
      return;
    }

    const getMaxFileSize = () => {
      const senderDeviceType =
        localStorage.getItem("fileflow_device_type") || "desktop";
      const ipAddress =
        localStorage.getItem("fileflow_device_ip") || "127.0.0.1";

      socket.emit(
        "Max-Allowed-File-Size",
        {
          targetSocketId: connectedDevice?.socketId,
          senderDeviceType,
          ipAddress,
        },
        (response) => {
          setMaxAllowedSize(response.allowedSize);
          setIsLoading(false);
        },
      );
    };

    getMaxFileSize();
  }, [transactionRoomId, connectedDevice?.socketId]);

  useEffect(() => {
    if (!transactionRoomId) {
      return;
    }

    const handleReceiveFileChunk = (payload) => {
      const { chunkData, isLastChunk, fileName, totalSize } = payload;
      const chunkLength = chunkData?.byteLength ?? chunkData?.length ?? 0;
      incomingChunksRef.current.push(chunkData);
      incomingSizeRef.current += chunkLength;

      const currentProgress = totalSize
        ? Math.round((incomingSizeRef.current / totalSize) * 100)
        : 0;
      updateProgress(currentProgress);
      setTransferMessage(`Receiving ${fileName}...`);
      console.log("Recieved a Chunk");

      if (isLastChunk) {
        const fileBlob = new Blob(incomingChunksRef.current);
        const downloadUrl = URL.createObjectURL(fileBlob);
        setDownloadInfo({
          name: fileName,
          size: incomingSizeRef.current,
          url: downloadUrl,
        });
        setTransferMessage(`${fileName} received`);
        setIsTransferring(false);
        incomingChunksRef.current = [];
        incomingSizeRef.current = 0;
      }
      try {
        socket.emit("CHUNK_ACKNOWLEDGE", {
          room: transactionRoomId,
          isLastChunk: isLastChunk,
        });
      } catch (err) {
        console.log("Failed to Process Chunk");
      }
    };
    socket.on("RECEIVE_FILE_CHUNK", handleReceiveFileChunk);

    return () => {
      socket.off("RECEIVE_FILE_CHUNK", handleReceiveFileChunk);
      incomingChunksRef.current = [];
      incomingSizeRef.current = 0;
    };
  }, [transactionRoomId]);

  const startFileStreaming = (socket, physicalFile, transactionRoomId) => {
    if (!transactionRoomId || !physicalFile) return;

    setIsTransferring(true);
    setTransferMessage(`Sending ${physicalFile.name}...`);
    setDownloadInfo(null);
    updateProgress(0);

    const CHUNK_SIZE = 64 * 1024;

    if (physicalFile.size > 500 * 1024 * 1024) {
     //Fileswith size greater than 500mb gets 1mb chunks
      CHUNK_SIZE = 1024 * 1024; 
    } else if (physicalFile.size > 100 * 1024 * 1024) {
      // Files with size between 100mb and 500mb gets 512kb chunks 
      CHUNK_SIZE = 512 * 1024;
    } else if (physicalFile.size > 10 * 1024 * 1024) {
      // Files with size 10MB and 100MB get 256KB chunks
      CHUNK_SIZE = 256 * 1024;
    }
    let offset = 0;
    const reader = new FileReader();

    socket.on("SEND_NEXT_CHUNK", () => {
      const currentProgress = physicalFile.size
        ? Math.round((offset / physicalFile.size) * 100)
        : 100;

      updateProgress(currentProgress);

      const isLastChunk = offset >= physicalFile.size;

      if (!isLastChunk) {
        readNextChunk();
      } else {
        setIsTransferring(false);
        setTransferMessage("Transfer Complete!");
        socket.off("SEND_NEXT_CHUNK");
      }
    });

    reader.onload = (event) => {
      const rawBuffer = event.target.result;
      offset += rawBuffer.byteLength;
      const isLastChunk = offset >= physicalFile.size;

      socket.emit("STREAM_FILE_CHUNK", {
        room: transactionRoomId,
        chunkData: rawBuffer,
        fileName: physicalFile.name,
        totalSize: physicalFile.size,
        isLastChunk,
      });
    };

    reader.onerror = () => {
      setIsTransferring(false);
      setValidationError("Unable to read the selected file. Please try again.");
      setTransferMessage("Ready to transfer");
      updateProgress(0);
    };

    const readNextChunk = () => {
      const slice = physicalFile.slice(offset, offset + CHUNK_SIZE);
      if (slice.size > 0) {
        reader.readAsArrayBuffer(slice);
      }
    };

    readNextChunk();
  };

  const triggerActualDownload = (downloadUrl, fileName) => {
    const ghostLink = document.createElement("a");
    ghostLink.href = downloadUrl;
    ghostLink.download = fileName || "fileflow_transfer";

    document.body.appendChild(ghostLink);
    ghostLink.click();

    document.body.removeChild(ghostLink);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setValidationError(null);

    if (!maxAllowedSize) {
      setValidationError("Loading device information...");
      return;
    }

    const validation = validateFile(file, maxAllowedSize);
    if (!validation.allowed) {
      setValidationError(validation.reason);
      setSelectedFile(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile && !validationError && transactionRoomId) {
      setValidationError(null);
      startFileStreaming(socket, selectedFile, transactionRoomId);
    }
  };

  if (!connectedDevice) {
    return (
      <div className="flex flex-col gap-4 mt-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          Transfer File
        </h2>
        <div className="relative border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] p-12 flex flex-col items-center justify-center gap-4 opacity-50">
          <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)] shadow-sm">
            <UploadCloud className="w-8 h-8 text-[var(--color-text-secondary)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Select a device to connect
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              You need to connect to a device before transferring files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          Connected to {connectedDevice.name}
        </h2>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-red-400 hover:text-red-300 hover:border-red-500/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>

      {/* File Type and Size Restrictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ALLOWED_FILE_TYPES).map(([key, category]) => (
          <div
            key={key}
            className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-4"
          >
            <p className="text-xs font-medium text-[var(--color-text-primary)] mb-2">
              {category.label}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {category.extensions.join(", ")}
            </p>
          </div>
        ))}
      </div>

      {/* Max File Size Info */}
      {maxAllowedSize && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <InfoIcon className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-blue-300">
            Maximum file size:{" "}
            <span className="font-medium">
              {formatFileSize(maxAllowedSize)}
            </span>
          </p>
        </div>
      )}

      {/* File Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Drop Zone */}
        <motion.div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          whileHover={!isDragging ? { scale: 1.01 } : {}}
          className={`relative border-2 border-dashed rounded-2xl bg-[var(--color-surface)] p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer shadow-sm min-h-64 ${
            isDragging
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
              : "border-[var(--color-accent)] border-opacity-50 hover:border-opacity-100"
          }`}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept={Object.values(ALLOWED_FILE_TYPES)
              .flatMap((cat) => cat.extensions)
              .join(",")}
            className="hidden"
          />

          {!selectedFile ? (
            <>
              <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)] shadow-sm">
                <UploadCloud className="w-8 h-8 text-[var(--color-text-primary)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {isDragging
                    ? "Drop your file here"
                    : "Drag and drop your file here"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  or click to browse
                </p>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              {/* Selected File Info */}
              <div className="w-full">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2.5 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] flex-shrink-0">
                      <UploadCloud className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Size: {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setValidationError(null);
                    }}
                    className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {validationError && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded mb-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{validationError}</p>
                  </div>
                )}

                {!validationError && selectedFile && (
                  <div className="flex items-center gap-2 p-2.5 bg-green-500/10 border border-green-500/30 rounded">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-green-300">Ready to transfer</p>
                  </div>
                )}
              </div>

              {/* Start Transfer Button */}
              {!validationError && selectedFile && (
                <button
                  onClick={handleUploadClick}
                  disabled={
                    !selectedFile || validationError !== null || isTransferring
                  }
                  className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {isTransferring ? "Transferring..." : "Start Transfer"}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex flex-col items-center justify-center gap-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] p-8 min-h-64">
          <CircularProgress
            progress={transferProgress}
            label={isLoading ? "Loading..." : transferMessage}
          />

          {downloadInfo && (
            <div className="w-full max-w-sm p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {downloadInfo.name} is ready
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {formatFileSize(downloadInfo.size)} downloaded.
              </p>
              <button
                onClick={() =>
                  triggerActualDownload(downloadInfo.url, downloadInfo.name)
                }
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-all"
              >
                Download Received File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple info icon since we're not importing from lucide-react for this one
const InfoIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
