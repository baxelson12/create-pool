import { decodeEventLog, getEventSelector, type Log } from 'viem';
import { INITIALIZE_EVENT_ABI as initializeEventAbi } from '../constants/events';

// ref: https://g.co/gemini/share/da1517531e94

/**
 * A type representing the successful output we want to extract.
 */
type ParsedForgeOutput = {
  transactionHash: string;
  decodedLog: ReturnType<typeof decodeEventLog<typeof initializeEventAbi>>;
};

/**
 * Parses the multi-line JSON output from `forge script --json`.
 * It finds and decodes the `Initialize` event and extracts the transaction hash.
 *
 * @param forgeOutput The raw string output from the `execSync` command.
 * @returns An object containing the transaction hash and the decoded event, or null if parsing fails.
 */
export function parseForgeOutput(
  forgeOutput: string
): ParsedForgeOutput | null {
  const jsonObjects: any[] = forgeOutput
    .split('\n')
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  let transactionHash: string | null = null;
  let rawLogs: Log[] | null = null;

  for (const obj of jsonObjects) {
    if (obj.tx_hash) {
      transactionHash = obj.tx_hash;
    }
    if (obj.raw_logs) {
      rawLogs = obj.raw_logs;
    }
  }

  if (!transactionHash) {
    console.error('Could not find transaction hash in forge output.');
    return null;
  }
  if (!rawLogs) {
    console.error('Could not find raw_logs in forge output.');
    return null;
  }

  const eventSelector = getEventSelector(initializeEventAbi[0]);
  const initializeLog = rawLogs.find((log) => log.topics[0] === eventSelector);

  if (!initializeLog) {
    console.error('Could not find the "Initialize" event in the logs.');
    return null;
  }

  try {
    const decodedLog = decodeEventLog({
      abi: initializeEventAbi,
      data: initializeLog.data,
      topics: initializeLog.topics,
    });

    return {
      transactionHash,
      decodedLog,
    };
  } catch (error) {
    console.error('Failed to decode event log with viem:', error);
    return null;
  }
}
