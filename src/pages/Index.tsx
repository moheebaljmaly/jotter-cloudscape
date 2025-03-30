
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { NoteCard } from "@/components/note-card";
import { Input } from "@/components/ui/input";
import { getNotes, searchNotes, Note } from "@/lib/note-service";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Load notes on initial render
  useEffect(() => {
    const loadNotes = () => {
      if (searchQuery.trim()) {
        setNotes(searchNotes(searchQuery));
      } else {
        setNotes(getNotes());
      }
    };
    
    loadNotes();
    
    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "notes-app-data") {
        loadNotes();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [searchQuery]);

  return (
    <Layout showAddButton title="مذكراتي">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث في المذكرات..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                searchQuery={searchQuery}
                onClick={() => navigate(`/view/${note.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="note-card-empty animate-fade-in mt-10">
            <FilePlus2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد ملاحظات</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "لم نجد أي ملاحظات تطابق بحثك. حاول بكلمات أخرى."
                : "ابدأ بإضافة ملاحظتك الأولى لتظهر هنا."}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/create")}>
                إضافة ملاحظة جديدة
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
