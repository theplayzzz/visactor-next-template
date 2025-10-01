import Container from "@/components/container";

export default function Loading() {
  return (
    <Container>
      <div className="flex flex-col gap-6 py-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />

        <div className="grid grid-cols-1 gap-6 phone:grid-cols-2 laptop:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
          <div className="h-96 animate-pulse rounded-lg border bg-muted" />
          <div className="h-96 animate-pulse rounded-lg border bg-muted" />
        </div>
      </div>
    </Container>
  );
}
