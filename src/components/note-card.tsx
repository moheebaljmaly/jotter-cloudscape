
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Note } from "@/lib/note-service";
import { ar } from "date-fns/locale";
import { useMemo } from "react";

interface NoteCardProps {
  note: Note;
  searchQuery?: string;
  onClick: () => void;
}

export function NoteCard({ note, searchQuery = "", onClick }: NoteCardProps) {
  // Format the date to show how long ago the note was updated
  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(note.updatedAt), { 
      addSuffix: true,
      locale: ar 
    });
  }, [note.updatedAt]);

  // Truncate content for preview (limit to ~100 characters)
  const previewContent = useMemo(() => {
    return note.content.length > 100 
      ? `${note.content.substring(0, 100)}...` 
      : note.content;
  }, [note.content]);

  // Highlight search terms if a query is provided
  const highlightSearchTerms = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  };

  const highlightedTitle = useMemo(
    () => highlightSearchTerms(note.title),
    [note.title, searchQuery]
  );

  const highlightedContent = useMemo(
    () => highlightSearchTerms(previewContent),
    [previewContent, searchQuery]
  );

  return (
    <Card 
      className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle 
          className="text-xl" 
          dangerouslySetInnerHTML={{ __html: highlightedTitle }} 
        />
        <CardDescription dir="rtl">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p 
          className="text-sm text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </CardContent>
    </Card>
  );
}
