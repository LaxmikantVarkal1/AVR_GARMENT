import GridView from "@/components/NewUI/gridView";

export default function Layout() {
    return (
        <div>
            <div>
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div>

                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">awesome-shadcn/ui</h1>
                        <p className="max-w-[900px] text-muted-foreground mb-4">A curated list of awesome things related to <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="underline">shadcn/ui</a></p>
                        <p className="text-sm text-muted-foreground">Created by: <a href="https://birobirobiro.dev/" target="_blank" rel="noopener noreferrer" className="underline">birobirobiro.dev</a></p>
                        <p className="text-xs text-muted-foreground">Site by: <a href="https://bankkroll.xyz" target="_blank" rel="noopener noreferrer" className="underline">bankkroll.xyz</a></p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8">
                <GridView />
            </div>
            <div> footer </div>
        </div>
    )
}