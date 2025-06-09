import { z } from 'zod';

// Reusable schema for an Ethereum address
const ethAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Please enter a valid Ethereum address (0x...).',
});

// Main schema for all pool creation parameters
export const poolCreationSchema = z.object({
  privateKey: z.string().min(1, { message: 'Private key cannot be empty.' }),
  currency0Address: ethAddressSchema,
  currency1Address: ethAddressSchema,
  currency0Price: z
    .number()
    .positive({ message: 'Price must be a positive number.' }),
  currency1Price: z
    .number()
    .positive({ message: 'Price must be a positive number.' }),
  fee: z
    .number()
    .int()
    .positive({ message: 'Fee must be a positive integer.' }),
  tickSpacing: z
    .number()
    .int()
    .positive({ message: 'Tick spacing must be a positive integer.' }),
  hooksAddress: ethAddressSchema,
});

// We can infer the TypeScript type directly from the Zod schema
export type PoolCreationConfig = z.infer<typeof poolCreationSchema>;
