export const metadata = {
  title: "Leafy Business Loan Assessor",
  description: "Assess business loan risks based on real estate locations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
