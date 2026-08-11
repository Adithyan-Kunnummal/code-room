import type { ChatMessage } from '../../hooks/UseRealtimeChat'

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: ChatMessageItemProps) => {
  return (
    <div className={`flex mt-2 text-white ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={"max-w-[75%] w-fit flex flex-col gap-1" + isOwnMessage ? "items-end" : ""}>
        <div className = "bg-[#2E392F] rounded p-2">
            {showHeader && (
            <div
              className={"flex items-center gap-2 text-xs px-3" + isOwnMessage ? 'justify-end flex-row-reverse': ""}>
              <span className={'font-medium'}>{message.user.name + " "}</span>
              <span className="text-foreground/50 text-xs">
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}
          <div
            className={
              'py-2 px-3 rounded-xl text-sm w-fit'+ isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}
          >
            {message.content}
          </div>
        </div>
        
      </div>
    </div>
  )
}
