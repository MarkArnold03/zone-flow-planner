import React, { useState } from 'react';
import { StickyNote, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';

export function NotesAnnotations() {
  const { state, addNote } = useDeliveryPlanning();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [sidebarNote, setSidebarNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({
        date: new Date(),
        content: newNote,
        type: 'general',
        position: { x: 0, y: 0 }
      });
      setNewNote('');
      setIsAddDialogOpen(false);
    }
  };

  const recentNotes = state.notes.slice(-3);

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StickyNote className="h-4 w-4" />
          <h4 className="text-sm font-medium">Notes</h4>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Create a note to track important information, reminders, or team communications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddNote} className="w-full">
                Add Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Recent Notes:</div>
          {recentNotes.map((note) => (
            <Card key={note.id} className="p-2">
              <CardContent className="p-0">
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1">
                    <p className="text-xs">{note.content}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs h-4"
                      >
                        {note.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {note.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sidebar Notepad */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-3 w-3" />
          <span className="text-xs text-muted-foreground">Quick Notes:</span>
        </div>
        <Textarea
          placeholder="Jot down plans, shifts, or reminders..."
          value={sidebarNote}
          onChange={(e) => setSidebarNote(e.target.value)}
          rows={3}
          className="text-xs"
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={() => {
            if (sidebarNote.trim()) {
              addNote({
                date: new Date(),
                content: sidebarNote,
                type: 'general',
                position: { x: 0, y: 0 }
              });
              setSidebarNote('');
            }
          }}
        >
          Save Note
        </Button>
      </div>

      {/* Help */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        💡 Notes help track important dispatcher information and team communications
      </div>
    </div>
  );
}