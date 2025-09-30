export const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-screen items-center justify-center">
    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
      {title}
    </h1>
  </div>
);