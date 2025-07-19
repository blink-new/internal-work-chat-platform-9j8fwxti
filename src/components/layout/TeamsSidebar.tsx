import { Plus, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface Team {
  id: string
  name: string
  description?: string
  createdAt: string
  createdBy: string
  isPublic: boolean
}

interface TeamsSidebarProps {
  teams: Team[]
  selectedTeam: Team | null
  onTeamSelect: (team: Team) => void
  onCreateTeam: () => void
}

export function TeamsSidebar({ teams, selectedTeam, onTeamSelect, onCreateTeam }: TeamsSidebarProps) {
  const getTeamInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="w-16 teams-sidebar flex flex-col items-center py-3 gap-2">
      <TooltipProvider>
        {/* Teams list */}
        <div className="flex flex-col gap-2">
          {teams.map((team) => (
            <Tooltip key={team.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-12 w-12 p-0 rounded-lg transition-all hover:rounded-xl ${
                    selectedTeam?.id === team.id
                      ? 'bg-white/20 rounded-xl'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => onTeamSelect(team)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-white/10 text-white font-semibold">
                      {getTeamInitials(team.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{team.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Separator */}
        {teams.length > 0 && (
          <div className="w-8 h-px bg-white/20 my-2"></div>
        )}

        {/* Add team button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-12 w-12 p-0 rounded-lg hover:rounded-xl hover:bg-white/10 transition-all"
              onClick={onCreateTeam}
            >
              <Plus className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Create or join a team</p>
          </TooltipContent>
        </Tooltip>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Bottom actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-12 w-12 p-0 rounded-lg hover:rounded-xl hover:bg-white/10 transition-all"
            >
              <Users className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Manage teams</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}