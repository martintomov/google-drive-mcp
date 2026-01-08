import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.guard';

/**
 * Decorator to mark a route as public (no API key required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
