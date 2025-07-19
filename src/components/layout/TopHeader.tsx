import { Search, Settings, Bell, MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'

interface User {
  id: string
  email: string
  displayName?: string
}

interface TopHeaderProps {
  user: User
}

export function TopHeader({ user }: TopHeaderProps) {
  const getInitials = (email: string, displayName?: string) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-4">
      {/* Left section - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in Teams"
            className="pl-10 h-8 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right section - User actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 ml-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(user.email, user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user.displayName || user.email.split('@')[0]}</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}