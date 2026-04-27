import { createFileRoute } from '@tanstack/react-router'
import { getFlowSnapshot } from '../../lib/data'

export const Route = createFileRoute('/api/snapshot')({
  server: {
    handlers: {
      GET: async () => Response.json(getFlowSnapshot()),
    },
  },
})
