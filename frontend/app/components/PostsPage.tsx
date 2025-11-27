'use client';

import { useState, useMemo, useEffect } from 'react';
import { Alert, Snackbar, Container, TextField, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PostForm, { PostFormData } from './PostForm';
import PostsList from './PostsList';
import { createPost, Post, getPosts } from '../lib/api';

export default function PostsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load all posts for client-side filtering
  useEffect(() => {
    const loadAllPosts = async () => {
      setIsLoadingPosts(true);
      try {
        // Load a large number of posts for client-side filtering
        const response = await getPosts(1, 100);
        setAllPosts(response.data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    loadAllPosts();
  }, []);

  // Client-side filtering of posts
  const filteredPosts = useMemo(() => {
    if (!clientSearch.trim()) {
      return allPosts;
    }
    const searchLower = clientSearch.toLowerCase();
    return allPosts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(searchLower);
      const bodyMatch = post.body?.toLowerCase().includes(searchLower);
      return titleMatch || bodyMatch;
    });
  }, [allPosts, clientSearch]);

  const handleSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const newPost = await createPost(data);
      setSnackbar({
        open: true,
        message: 'Post created successfully!',
        severity: 'success',
      });
      // Add the new post to the list
      setAllPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create post',
        severity: 'error',
      });
      throw error; // Re-throw to prevent form reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PostForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      <Box sx={{ my: 4 }}>
        <TextField
          fullWidth
          label="Search Posts (Client-side)"
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Search by title or body..."
          sx={{ mb: 3 }}
          disabled={isLoadingPosts}
        />
        
        {clientSearch && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing {filteredPosts.length} result(s) for "{clientSearch}"
          </Alert>
        )}
        
        {/* Display filtered posts when client search is active, otherwise show normal list */}
        <PostsList
          page={1}
          limit={10}
          customPosts={clientSearch ? filteredPosts : undefined}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

