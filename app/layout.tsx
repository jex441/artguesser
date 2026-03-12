import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Artistry — Guess the Artist",
	description:
		"Test your art history knowledge by guessing the artist behind famous artworks.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Analytics />
			<html lang="en">
				<body className="min-h-screen bg-white text-stone-900 antialiased">
					<header className="border-b border-stone-100 px-6 py-4">
						<a href="/" className="inline-block">
							<h1 className="text-2xl font-serif tracking-widest text-stone-800 uppercase">
								Artistry
							</h1>
						</a>
					</header>
					<main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
				</body>
			</html>
		</>
	);
}
