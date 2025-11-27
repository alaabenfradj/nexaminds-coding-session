'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';

export interface PostFormData {
  title: string;
  body: string;
}

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function PostForm({ onSubmit, isLoading = false }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; body?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!body.trim()) {
      newErrors.body = 'Body is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
      // Reset form on success
      setTitle('');
      setBody('');
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Post
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors({ ...errors, title: undefined });
            }
          }}
          error={!!errors.title}
          helperText={errors.title}
          margin="normal"
          required
          disabled={isLoading}
        />
        <TextField
          fullWidth
          label="Body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (errors.body) {
              setErrors({ ...errors, body: undefined });
            }
          }}
          error={!!errors.body}
          helperText={errors.body}
          margin="normal"
          required
          multiline
          rows={4}
          disabled={isLoading}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !title.trim() || !body.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

