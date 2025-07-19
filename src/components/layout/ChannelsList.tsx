import { Hash, Lock, Volume2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { useState } from 'react'

interface Team {
  id: string
  name: string
  description?: string
  createdAt: string
  createdBy: string
  isPublic: boolean
}

interface Channel {
  id: string
  teamId: string
  name: string
  description?: string
  type: string
  createdAt: string
  createdBy: string
}

interface ChannelsListProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onChannelSelect: (channel: Channel) => void
  selectedTeam: Team | null
}

export function ChannelsList({ channels, selectedChannel, onChannelSelect, selectedTeam }: ChannelsListProps) {
  const [isChannelsExpanded, setIsChannelsExpanded] = useState(true)

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4" />
      case 'announcement':
        return <Volume2 className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  if (!selectedTeam) {
    return (
      <div className="w-64 teams-channel-list border-r border-border flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Select a team to view channels</p>
      </div>
    )
  }

  return (
    <div className="w-64 teams-channel-list border-r border-border flex flex-col">
      {/* Team header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg truncate">{selectedTeam.name}</h2>
        {selectedTeam.description && (
          <p className="text-sm text-muted-foreground truncate">{selectedTeam.description}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Channels section */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsChannelsExpanded(!isChannelsExpanded)}
            >
              {isChannelsExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">Channels</span>
              <Plus className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100" />
            </Button>

            {isChannelsExpanded && (
              <div className="ml-2 space-y-1">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start p-2 h-8 text-left ${
                      selectedChannel?.id === channel.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onChannelSelect(channel)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getChannelIcon(channel.type)}
                      <span className="text-sm truncate">{channel.name}</span>
                    </div>
                  </Button>
                ))}

                {channels.length === 0 && (
                  <div className="ml-6 py-2">
                    <p className="text-xs text-muted-foreground">No channels yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Messages section */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Direct messages</span>
              <Plus className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100" />
            </Button>
          </div>

          {/* More section */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">More</span>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}