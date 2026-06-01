// Allowed file types by category
export const ALLOWED_FILE_TYPES = {
  media: {
    extensions: ['.mp4', '.mkv', '.mov', '.mp3', '.wav', '.png', '.jpeg', '.jpg', '.gif', '.webp'],
    mimeTypes: ['video/mp4', 'video/x-matroska', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    label: 'Media'
  },
  documents: {
    extensions: ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.csv'],
    mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv'],
    label: 'Documents'
  },
  archives: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz'],
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
    label: 'Archives'
  }
};

export const BLOCKED_FILE_TYPES = {
  executables: {
    extensions: ['.exe', '.dmg', '.pkg', '.bat', '.sh'],
    label: 'Executables'
  }
};

// Get all allowed extensions
export const getAllowedExtensions = () => {
  return Object.values(ALLOWED_FILE_TYPES).flatMap(cat => cat.extensions);
};

// Get all blocked extensions
export const getBlockedExtensions = () => {
  return Object.values(BLOCKED_FILE_TYPES).flatMap(cat => cat.extensions);
};

// Get file extension
export const getFileExtension = (filename) => {
  // Handle double extensions like .tar.gz
  if (filename.endsWith('.tar.gz')) return '.tar.gz';
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
};

// Validate file type
export const isFileTypeAllowed = (filename) => {
  const extension = getFileExtension(filename);
  
  // Check if blocked
  if (getBlockedExtensions().includes(extension)) {
    return { allowed: false, reason: 'Executable files are not allowed' };
  }
  
  // Check if allowed
  if (getAllowedExtensions().includes(extension)) {
    return { allowed: true };
  }
  
  return { allowed: false, reason: 'File type not supported' };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate file size
export const isFileSizeAllowed = (fileSize, maxAllowedSize) => {
  return fileSize <= maxAllowedSize;
};

// Validate file (type and size)
export const validateFile = (file, maxAllowedSize) => {
  // Check file type
  const typeValidation = isFileTypeAllowed(file.name);
  if (!typeValidation.allowed) {
    return typeValidation;
  }
  
  // Check file size
  if (!isFileSizeAllowed(file.size, maxAllowedSize)) {
    return {
      allowed: false,
      reason: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxAllowedSize)}`
    };
  }
  
  return { allowed: true };
};

// Get file category
export const getFileCategory = (filename) => {
  const extension = getFileExtension(filename);
  
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.extensions.includes(extension)) {
      return category;
    }
  }
  
  return null;
};
