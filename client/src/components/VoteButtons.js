import React from 'react';
import { IconButton } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';

export default function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  disabled,
}) {
  const handleVote = (voteType, e) => {
    if (e) {
      e.stopPropagation();
    }
    onVote(voteType);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton
        onClick={(e) => handleVote('upvote', e)}
        disabled={disabled}
        sx={{
          backgroundColor: userVote === 'upvote' ? '#22B20522' : 'transparent',
          color: userVote === 'upvote' ? '#22B205' : '#fff',
          borderRadius: '12px',
          padding: '6px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#22B20544',
            transform: 'scale(1.1)',
          },
        }}
      >
        <ThumbUp />
      </IconButton>

      <span style={{ color: '#fff', minWidth: 20 }}>{upvotes}</span>

      <IconButton
        onClick={(e) => handleVote('downvote', e)}
        disabled={disabled}
        sx={{
          backgroundColor: userVote === 'downvote' ? '#FF4C4C22' : 'transparent',
          color: userVote === 'downvote' ? '#FF4C4C' : '#fff',
          borderRadius: '12px',
          padding: '6px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#FF4C4C44',
            transform: 'scale(1.1)',
          },
        }}
      >
        <ThumbDown />
      </IconButton>

      <span style={{ color: '#fff', minWidth: 20 }}>{downvotes}</span>
    </div>
  );
}
