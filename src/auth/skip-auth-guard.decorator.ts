import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_GUARD = 'skipAuthGuard';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_GUARD, true);
