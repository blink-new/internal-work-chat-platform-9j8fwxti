import { useState, useEffect, useCallback } from 'react'
import { blink } from '../../blink/client'
import { TeamsSidebar } from './TeamsSidebar'
import { ChannelsList } from './ChannelsList'
import { ChatArea } from './ChatArea'
import { TopHeader } from './TopHeader'

interface User {
  id: string
  email: string
  displayName?: string
}

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

export function TeamsLayout() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadTeams()
    }
  }, [user, loadTeams])

  useEffect(() => {
    if (selectedTeam) {
      loadChannels(selectedTeam.id)
    }
  }, [selectedTeam, loadChannels])

  const loadTeams = useCallback(async () => {
    try {
      const userTeams = await blink.db.teams.list({
        where: { isPublic: "1" },
        orderBy: { createdAt: 'desc' }
      })
      setTeams(userTeams)
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }, [selectedTeam])

  const loadChannels = useCallback(async (teamId: string) => {
    try {
      const teamChannels = await blink.db.channels.list({
        where: { teamId },
        orderBy: { createdAt: 'asc' }
      })
      setChannels(teamChannels)
      if (teamChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(teamChannels[0])
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }, [selectedChannel])

  const createDefaultData = async () => {
    if (!user) return

    try {
      // Create a default team
      const defaultTeam = await blink.db.teams.create({
        id: `team_${Date.now()}`,
        name: 'General Team',
        description: 'Default team for company-wide communication',
        createdBy: user.id,
        isPublic: true
      })

      // Create default channels
      await blink.db.channels.createMany([
        {
          id: `channel_${Date.now()}_1`,
          teamId: defaultTeam.id,
          name: 'general',
          description: 'General discussion',
          type: 'standard',
          createdBy: user.id
        },
        {
          id: `channel_${Date.now()}_2`,
          teamId: defaultTeam.id,
          name: 'random',
          description: 'Random conversations',
          type: 'standard',
          createdBy: user.id
        }
      ])

      // Add user to team
      await blink.db.teamMembers.create({
        id: `member_${Date.now()}`,
        teamId: defaultTeam.id,
        userId: user.id,
        role: 'owner'
      })

      loadTeams()
    } catch (error) {
      console.error('Failed to create default data:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Teams...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Welcome to Teams</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopHeader user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <TeamsSidebar 
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
          onCreateTeam={createDefaultData}
        />
        
        <ChannelsList 
          channels={channels}
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
          selectedTeam={selectedTeam}
        />
        
        <ChatArea 
          selectedChannel={selectedChannel}
          user={user}
        />
      </div>
    </div>
  )
}