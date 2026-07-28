// CipherGate Text Prompt Dialog
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, alpha } from '@mui/material';
import React, { useState } from 'react';
import { palette } from '../config/theme';

/**
 * The props required by the {@link TextPromptDialog} component.
 */
export interface TextPromptDialogProps {
  /** The prompt to display to the user. */
  prompt: string;
  /** `true` to render the dialog opened; otherwise closed. */
  isOpen: boolean;
  /** A callback that will be called if the user cancels the dialog. */
  onCancel: () => void;
  /** A callback that will be called when the user submits their inputted data. */
  onSubmit: (text: string) => void;
}

/**
 * A modern glass-morphism dialog for entering a single text value.
 */
export const TextPromptDialog: React.FC<Readonly<TextPromptDialogProps>> = ({ prompt, isOpen, onCancel, onSubmit }) => {
  const [text, setText] = useState<string>('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && text.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: { timeout: 300 },
        paper: {
          sx: {
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#0a0e27', 0.98)} 100%)`,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${alpha(palette.accent.primary, 0.1)}`,
            boxShadow: `0 24px 80px ${alpha('#000', 0.6)}`,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography
          variant="body1"
          data-testid="textprompt-dialog-title"
          sx={{
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '0.9375rem',
            letterSpacing: '0.01em',
          }}
        >
          {prompt}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          id="text-prompt"
          variant="outlined"
          focused
          fullWidth
          size="small"
          autoComplete="off"
          placeholder="0x..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={(input: HTMLInputElement | null) => input?.focus()}
          data-testid="textprompt-dialog-text-prompt"
          slotProps={{
            htmlInput: {
              style: {
                color: '#e2e8f0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8125rem',
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#000', 0.3),
              '& fieldset': { borderColor: alpha(palette.accent.primary, 0.15) },
              '&:hover fieldset': { borderColor: alpha(palette.accent.primary, 0.35) },
              '&.Mui-focused fieldset': { borderColor: palette.accent.primary },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          data-testid="textprompt-dialog-cancel-btn"
          disableElevation
          onClick={onCancel}
          sx={{
            color: '#94a3b8',
            borderColor: alpha('#94a3b8', 0.2),
            '&:hover': {
              borderColor: alpha('#94a3b8', 0.4),
              bgcolor: alpha('#94a3b8', 0.04),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          data-testid="textprompt-dialog-ok-btn"
          disabled={!text.trim().length}
          disableElevation
          onClick={handleSubmit}
          type="submit"
          sx={{
            bgcolor: palette.accent.primary,
            color: '#0a0e27',
            fontWeight: 700,
            '&:hover': { bgcolor: alpha(palette.accent.primary, 0.85) },
            '&.Mui-disabled': { bgcolor: alpha(palette.accent.primary, 0.15), color: alpha('#0a0e27', 0.3) },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
