interface EditorFooterProps {
    users: string[]
}

export default function EditorFooter({ users }: EditorFooterProps) {

    return (
        <footer className="h-14 border-t border-[#40513B] bg-[#30312F] px-6 flex items-center justify-between">

            <div className="flex gap-2 flex-wrap">

                {users.length === 0 ? (
                    <div className="h-full">
                        <img className="w-12 object-cover h-full" src="/spinner.svg" alt="loading" />
                    </div>
                ) : (
                    users.map((u) => (
                        <span
                            key={u}
                            className="px-3 py-1 rounded-full bg-[#40513B] text-sm"
                        >
                            {u}
                        </span>
                    ))
                )}

            </div>

            <span className="text-[#8A9B8C] text-sm">
                {users.length} online
            </span>

        </footer>
    )
}