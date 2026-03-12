import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-col items-center gap-12 animate-fade-in">
			<div className="text-center space-y-4">
				<p className="text-xs tracking-[0.3em] uppercase text-stone-400">
					An art history game
				</p>
				<h2 className="text-4xl font-serif text-stone-800">Guess the Artist</h2>
				<p className="text-stone-500 max-w-sm mx-auto leading-relaxed">
					Seven artworks. One question. Who painted it?
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
				<Link href="/quiz/easy">
					<div className="group border border-stone-200 rounded-sm p-8 text-center cursor-pointer hover:border-stone-800 hover:bg-stone-50 transition-all duration-300">
						<div className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-2 group-hover:text-stone-600 transition-colors">
							Mode
						</div>
						<div className="text-2xl font-serif text-stone-800 mb-3">Easy</div>
						<div className="text-sm text-stone-400 leading-relaxed">
							Choose from four artists
						</div>
					</div>
				</Link>

				<Link href="/quiz/hard">
					<div className="group border border-stone-200 rounded-sm p-8 text-center cursor-pointer hover:border-stone-800 hover:bg-stone-50 transition-all duration-300">
						<div className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-2 group-hover:text-stone-600 transition-colors">
							Mode
						</div>
						<div className="text-2xl font-serif text-stone-800 mb-3">Hard</div>
						<div className="text-sm text-stone-400 leading-relaxed">
							Search and name the artist
						</div>
					</div>
				</Link>
			</div>

			<div className="text-xs text-stone-300 tracking-wider">
				7 artworks per round
			</div>
		</div>
	);
}
