'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  AttachFile,
  Send,
  Delete,
  Download,
  Image as ImageIcon,
  Close,
} from '@mui/icons-material';

interface ImageFile {
  file: File;
  preview: string;
}

interface SentItem {
  id: string;
  text: string;
  images: ImageFile[];
  timestamp: Date;
}

export default function TextImageUploader() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [sentItems, setSentItems] = useState<SentItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        imageFiles.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    });

    setImages((prev) => [...prev, ...imageFiles]);
  }, []);

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    const image = images[index];
    URL.revokeObjectURL(image.preview);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleSend = () => {
    if (!text.trim() && images.length === 0) return;

    const newItem: SentItem = {
      id: Date.now().toString(),
      text: text.trim(),
      images: [...images],
      timestamp: new Date(),
    };

    setSentItems((prev) => [...prev, newItem]);
    setText('');
    setImages([]);
    setSelectedItems(new Set());
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const item = sentItems.find((i) => i.id === itemId);
    if (item) {
      item.images.forEach((img) => URL.revokeObjectURL(img.preview));
    }
    setSentItems((prev) => prev.filter((i) => i.id !== itemId));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach((itemId) => {
      const item = sentItems.find((i) => i.id === itemId);
      if (item) {
        item.images.forEach((img) => URL.revokeObjectURL(img.preview));
      }
    });
    setSentItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
    setSelectedItems(new Set());
  };

  const handleExportItem = (item: SentItem) => {
    const exportObj = {
      id: item.id,
      text: item.text,
      imageCount: item.images.length,
      timestamp: item.timestamp.toISOString(),
    };
    setExportData(JSON.stringify(exportObj, null, 2));
    setExportDialogOpen(true);
  };

  const handleExportSelected = () => {
    const selected = sentItems.filter((item) => selectedItems.has(item.id));
    const exportObj = selected.map((item) => ({
      id: item.id,
      text: item.text,
      imageCount: item.images.length,
      timestamp: item.timestamp.toISOString(),
    }));
    setExportData(JSON.stringify(exportObj, null, 2));
    setExportDialogOpen(true);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };

  const canSend = text.trim().length > 0 || images.length > 0;
  const hasSelection = selectedItems.size > 0;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      {/* Header with bulk actions */}
      <AppBar 
        position="static" 
        elevation={2}
        sx={{
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <ImageIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 0.5 }}>
            Text + Image Uploader
          </Typography>
          {hasSelection && (
            <Stack 
              direction="row" 
              spacing={1}
              sx={{
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteSelected}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                Delete ({selectedItems.size})
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportSelected}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                Export Selected
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Scrollable content area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: 'background.default',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        {sentItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              px: 2,
            }}
          >
            <ImageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Start by typing a message or uploading images below. Your messages will appear here!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {sentItems.map((item, index) => (
              <Card 
                key={item.id} 
                sx={{ 
                  mb: 2.5,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                  border: selectedItems.has(item.id) ? '2px solid' : '1px solid',
                  borderColor: selectedItems.has(item.id) ? 'primary.main' : 'divider',
                  boxShadow: selectedItems.has(item.id) 
                    ? '0 8px 16px rgba(102, 126, 234, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                  animation: 'slideIn 0.4s ease-out',
                  animationDelay: `${index * 0.05}s`,
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      sx={{
                        mt: -1,
                        '& .MuiSvgIcon-root': {
                          fontSize: 28,
                        },
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {item.text && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2,
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                            color: 'text.primary',
                          }}
                        >
                          {item.text}
                        </Typography>
                      )}
                      {item.images.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            mb: 2,
                          }}
                        >
                          {item.images.map((img, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                position: 'relative',
                                width: { xs: 80, sm: 120 },
                                height: { xs: 80, sm: 120 },
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '2px solid',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  borderColor: 'primary.main',
                                  boxShadow: 4,
                                },
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={img.preview}
                                alt={`Preview ${idx + 1}`}
                                sx={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                        <Chip
                          label={item.timestamp.toLocaleString()}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                        {item.images.length > 0 && (
                          <Chip
                            icon={<ImageIcon sx={{ fontSize: 16 }} />}
                            label={`${item.images.length} image${item.images.length > 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleExportItem(item)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Fixed input area at bottom */}
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 3 },
          borderTop: isDragging ? '4px solid' : 'none',
          borderColor: 'primary.main',
          backgroundColor: isDragging 
            ? 'action.hover' 
            : 'background.paper',
          borderRadius: 0,
          transition: 'all 0.3s ease-in-out',
          boxShadow: isDragging 
            ? '0 -4px 20px rgba(102, 126, 234, 0.3)' 
            : '0 -2px 10px rgba(0,0,0,0.1)',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropZoneRef}
      >
        {isDragging && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              '& .MuiAlert-icon': {
                color: 'primary.contrastText',
              },
            }}
            icon={<ImageIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Drop images here to attach them
            </Typography>
          </Alert>
        )}

        {/* Image previews */}
        {images.length > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              mb: 2.5,
              p: 1.5,
              backgroundColor: 'action.hover',
              borderRadius: 2,
            }}
          >
            {images.map((img, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: { xs: 70, sm: 90 },
                  height: { xs: 70, sm: 90 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={img.preview}
                  alt={`Preview ${index + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    width: 28,
                    height: 28,
                    '&:hover': { 
                      backgroundColor: 'error.main',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.default',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <IconButton
              color="primary"
              onClick={handleFilePicker}
              title="Attach images"
              sx={{
                backgroundColor: 'action.hover',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <AttachFile />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Send />}
              onClick={handleSend}
              disabled={!canSend}
              sx={{ 
                minWidth: 120,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Send
            </Button>
          </Box>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </Paper>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Download />
            Export JSON Data
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review the JSON data below. You can edit it before downloading.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={exportData}
            onChange={(e) => setExportData(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                '& textarea': {
                  fontFamily: 'monospace',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDownloadJSON} 
            variant="contained" 
            startIcon={<Download />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            Download JSON
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

