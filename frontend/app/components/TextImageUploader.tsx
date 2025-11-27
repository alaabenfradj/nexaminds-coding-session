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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with bulk actions */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Text + Image Uploader
          </Typography>
          {hasSelection && (
            <Stack direction="row" spacing={1}>
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteSelected}
                size="small"
              >
                Delete Selected ({selectedItems.size})
              </Button>
              <Button
                color="primary"
                startIcon={<Download />}
                onClick={handleExportSelected}
                size="small"
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
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        {sentItems.length === 0 ? (
          <Alert severity="info">No items sent yet. Create your first message below!</Alert>
        ) : (
          <List>
            {sentItems.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                    />
                    <Box sx={{ flex: 1 }}>
                      {item.text && (
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {item.text}
                        </Typography>
                      )}
                      {item.images.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          {item.images.map((img, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                position: 'relative',
                                width: 100,
                                height: 100,
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={img.preview}
                                alt={`Preview ${idx + 1}`}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {item.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleExportItem(item)}
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Box>

      {/* Fixed input area at bottom */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: isDragging ? '3px solid' : 'none',
          borderColor: 'warning.main',
          backgroundColor: isDragging ? 'warning.light' : 'background.paper',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropZoneRef}
      >
        {isDragging && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Drop images here to attach them
          </Alert>
        )}

        {/* Image previews */}
        {images.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {images.map((img, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
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
                    top: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              color="primary"
              onClick={handleFilePicker}
              title="Attach images"
            >
              <AttachFile />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Send />}
              onClick={handleSend}
              disabled={!canSend}
              sx={{ minWidth: 100 }}
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
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Export JSON</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={exportData}
            onChange={(e) => setExportData(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
          <Button onClick={handleDownloadJSON} variant="contained" startIcon={<Download />}>
            Download JSON
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

