'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Skeleton,
  Stack,
} from '@mui/material';
import { getPosts, Post, PaginatedPostsResponse } from '../lib/api';

interface PostsListProps {
  page?: number;
  limit?: number;
  search?: string;
  onPostsChange?: (posts: Post[]) => void;
  customPosts?: Post[]; // For client-side filtered posts
}

export default function PostsList({
  page = 1,
  limit = 10,
  search,
  onPostsChange,
  customPosts,
}: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PaginatedPostsResponse['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPosts(page, limit, search);
      setPosts(response.data);
      setMeta(response.meta);
      if (onPostsChange) {
        onPostsChange(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If customPosts is provided, use it instead of fetching
    if (customPosts !== undefined) {
      setPosts(customPosts);
      setMeta({
        total: customPosts.length,
        page: 1,
        limit: customPosts.length,
        totalPages: 1,
      });
      setIsLoading(false);
      setError(null);
    } else {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, customPosts]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Box>
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Card key={i} elevation={2}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchPosts}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <Alert severity="info">
        <Typography variant="body1">No posts found.</Typography>
        {search && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Try adjusting your search terms.
          </Typography>
        )}
      </Alert>
    );
  }

  // Success state - display posts
  return (
    <Box>
      {meta && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {posts.length} of {meta.total} posts (Page {meta.page} of{' '}
          {meta.totalPages})
        </Typography>
      )}
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card elevation={2} sx={{ '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {post.body}
                </Typography>
                {post.userId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    User ID: {post.userId}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

