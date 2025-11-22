import UserCardGrid from '@/components/gridCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import UserProfile from '@/components/UserProfile'

export default function User({tasks}:any) {
  return (
    <div className="p-3 flex flex-col">
    <div className="ml-auto">
    <Popover>
      <PopoverTrigger asChild>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <UserProfile />
      </PopoverContent>
    </Popover>
    </div>
    <UserCardGrid tasks={tasks} />
  </div>
  )
}
