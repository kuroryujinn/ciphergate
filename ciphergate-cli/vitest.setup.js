// CipherGate CLI — Vitest Setup
// SPDX-License-Identifier: Apache-2.0

import protobuf from 'protobufjs';
import Long from 'long';

protobuf.util.Long = Long;
protobuf.configure();
