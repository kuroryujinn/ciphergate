// CipherGate Privacy Demonstration Page
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, Typography, Card, CardContent, alpha, Divider } from '@mui/material';
import LockIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';

import KeyIcon from '@mui/icons-material/VpnKeyOutlined';
import FingerprintIcon from '@mui/icons-material/FingerprintOutlined';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { colors } from '../config/theme';

const FlowArrow: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
    <ArrowDownwardIcon sx={{ color: alpha('#fff', 0.2), fontSize: 20 }} />
  </Box>
);

interface PrivacyStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isPrivate: boolean;
  accent: string;
}

const PrivacyStep: React.FC<PrivacyStepProps> = ({ icon, title, description, isPrivate, accent }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#1e2240', 0.6)} 100%)`,
      border: `1px solid ${alpha(accent, 0.2)}`,
      borderRadius: 2,
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: alpha(accent, 0.4),
        transform: 'translateX(4px)',
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -1,
        left: 24,
        right: 24,
        height: 2,
        borderRadius: 1,
        background: `linear-gradient(90deg, ${alpha(accent, 0.3)}, ${alpha(accent, 0.8)}, ${alpha(accent, 0.3)})`,
      }}
    />
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            minWidth: 40,
            background: alpha(accent, 0.1),
            border: `1px solid ${alpha(accent, 0.2)}`,
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: accent,
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.05em',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            background: isPrivate ? alpha(colors.cyberTeal, 0.1) : alpha(colors.warningAmber, 0.1),
            border: `1px solid ${isPrivate ? alpha(colors.cyberTeal, 0.2) : alpha(colors.warningAmber, 0.2)}`,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: isPrivate ? colors.cyberTeal : colors.warningAmber,
              fontWeight: 700,
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {isPrivate ? 'Private' : 'Public'}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const PrivacyPage: React.FC = () => {
  const steps: PrivacyStepProps[] = [
    {
      icon: <KeyIcon sx={{ fontSize: 20 }} />,
      title: '1. Secret Key (Client-Side)',
      description:
        'A 32-byte random secret key is generated on your device. This key is the root of all identity and authorization. It never leaves your machine and is never written to the blockchain.',
      isPrivate: true,
      accent: colors.cyberTeal,
    },
    {
      icon: <VisibilityOffIcon sx={{ fontSize: 20 }} />,
      title: '2. Private Witness',
      description:
        'The secret key is provided to the Compact circuit as a private witness. The circuit can use it to prove ownership or authorization without revealing the key itself. Witness data is ephemeral and exists only for the duration of proof generation.',
      isPrivate: true,
      accent: colors.cyberTeal,
    },
    {
      icon: <FingerprintIcon sx={{ fontSize: 20 }} />,
      title: '3. Hash Commitment (One-Way)',
      description:
        'The circuit hashes the secret key using persistentHash to produce a commitment: publicKey(sk). This is a one-way operation — the public key can be derived from the secret key, but the secret key cannot be reversed from the public key.',
      isPrivate: true,
      accent: '#7dd3fc',
    },
    {
      icon: <EnhancedEncryptionIcon sx={{ fontSize: 20 }} />,
      title: '4. Zero-Knowledge Proof',
      description:
        'A ZK proof is generated attesting that the caller knows a secret key whose public key matches an authorized on-chain value. The proof server produces this proof without learning the secret key. The blockchain verifies the proof without seeing which key was used.',
      isPrivate: true,
      accent: colors.electricViolet,
    },
    {
      icon: <LockIcon sx={{ fontSize: 20 }} />,
      title: '5. Encrypted On-Chain Data',
      description:
        'File payloads and sharing keys are stored as Opaque strings on the ledger. The contract never decrypts or inspects these values — it only stores and retrieves them. Without the correct decryption key, the data is meaningless.',
      isPrivate: false,
      accent: colors.warningAmber,
    },
    {
      icon: <StorageIcon sx={{ fontSize: 20 }} />,
      title: '6. Public Ledger State',
      description:
        'The Midnight ledger stores only: vault state (VACANT/PRIVATE/SHARED), public key commitments (hashes), and opaque encrypted payloads. A bystander can observe the vault lifecycle but cannot decrypt any content or determine who is accessing it.',
      isPrivate: false,
      accent: '#94a3b8',
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
            mb: 1,
            background: `linear-gradient(135deg, ${colors.cyberTeal}, ${colors.electricViolet})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Privacy Architecture
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600, lineHeight: 1.7 }}>
          CipherGate uses zero-knowledge proofs and client-side encryption to ensure that sensitive data never leaves
          your device. The blockchain enforces access policies without ever seeing your secrets.
        </Typography>
      </Box>

      {/* Privacy Flow Diagram */}
      <Box sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <PrivacyStep {...step} />
            {index < steps.length - 1 && <FlowArrow />}
          </React.Fragment>
        ))}
      </Box>

      {/* Public vs Private State Table */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha('#12162a', 0.95)} 0%, ${alpha('#1e2240', 0.6)} 100%)`,
          border: `1px solid ${alpha(colors.cyberTeal, 0.12)}`,
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: 24,
            right: 24,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, ${alpha(colors.cyberTeal, 0.3)}, ${alpha(colors.cyberTeal, 0.8)}, ${alpha(colors.cyberTeal, 0.3)})`,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              mb: 2,
              color: colors.cyberTeal,
            }}
          >
            Public State (On-Chain)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {[
              { field: 'state', desc: 'Vault lifecycle: VACANT, PRIVATE, or SHARED' },
              { field: 'owner', desc: 'Public key hash of the vault owner (commitment)' },
              { field: 'authorizedRecipient', desc: 'Public key hash of the recipient' },
              { field: 'encryptedPayload', desc: 'Opaque encrypted string — meaningless without key' },
              {
                field: 'encryptedSharingKey',
                desc: 'Opaque encrypted string — the symmetric key wrapped for recipient',
              },
              { field: 'accessCount', desc: 'Monotonically increasing counter (audit trail)' },
            ].map((item) => (
              <Box
                key={item.field}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  background: alpha('#000', 0.2),
                  border: `1px solid ${alpha('#94a3b8', 0.08)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: colors.warningAmber,
                    fontWeight: 600,
                    minWidth: 180,
                    fontSize: '0.7rem',
                  }}
                >
                  {item.field}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', lineHeight: 1.5 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: alpha('#fff', 0.06), my: 2 }} />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              mb: 2,
              mt: 2,
              color: colors.cyberTeal,
            }}
          >
            Private State (Client-Side Only)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              {
                field: 'secretKey',
                desc: '32-byte secret key. Created by createCipherGatePrivateState(randomBytes(32)). Never leaves the private state provider.',
              },
            ].map((item) => (
              <Box
                key={item.field}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  background: alpha(colors.cyberTeal, 0.04),
                  border: `1px solid ${alpha(colors.cyberTeal, 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: colors.cyberTeal,
                    fontWeight: 600,
                    minWidth: 180,
                    fontSize: '0.7rem',
                  }}
                >
                  {item.field}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', lineHeight: 1.5 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha(colors.cyberTeal, 0.06)} 0%, transparent 100%)`,
          border: `1px solid ${alpha(colors.cyberTeal, 0.15)}`,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: colors.cyberTeal,
              fontWeight: 700,
              fontSize: '0.8125rem',
              mb: 1,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Key Privacy Guarantee
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              fontSize: '0.8125rem',
              lineHeight: 1.7,
            }}
          >
            The blockchain never sees your secret key — it only sees a hash commitment (the public key). When you access
            a vault, the zero-knowledge proof verifies that you know a secret key whose public key matches an authorized
            on-chain value, without revealing which key it is. The encrypted payload and sharing key stored on-chain are
            meaningless ciphertext without the corresponding decryption keys, which exist only on authorized clients.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
