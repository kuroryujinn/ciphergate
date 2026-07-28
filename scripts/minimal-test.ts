import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;

console.log('Starting minimal test...');

try {
  console.log('1. Importing setNetworkId...');
  const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
  setNetworkId('undeployed');
  
  console.log('2. Importing getTestEnvironment...');
  const { getTestEnvironment } = await import('@midnight-ntwrk/testkit-js');
  
  console.log('3. Creating logger...');
  const pino = await import('pino');
  const logger = pino.pino({ level: 'info' });
  
  console.log('4. Starting test env...');
  const testEnv = getTestEnvironment(logger);
  const envConfig = await testEnv.start();
  
  console.log('5. Environment started:', JSON.stringify(envConfig).substring(0, 200));
  
  await testEnv.shutdown();
  console.log('SUCCESS');
} catch (err: any) {
  console.error('ERROR:', err?.message || String(err));
  console.error('Stack:', err?.stack);
  process.exit(1);
}
