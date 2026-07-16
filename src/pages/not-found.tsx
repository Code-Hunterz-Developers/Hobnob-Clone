import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
        <SearchX className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        404 Not Found
      </h1>
      <p className="font-sans text-lg text-muted-foreground max-w-md mb-8">
        Looks like this trail missed the Lavashak counter. Let's get you back to the signature treats.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full px-8 h-14">
          Return to Store
        </Button>
      </Link>
    </div>
  );
}
