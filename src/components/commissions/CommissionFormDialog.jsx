import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CommissionFormDialog({ open, onOpenChange, commission, onSubmit, onDelete, isSubmitting }) {
  const [formData, setFormData] = useState(commission || {
    name: "",
    description: "",
    percentage: 0,
    applies_to: [],
    icon: "dollar-sign",
    is_active: true
  });

  React.useEffect(() => {
    if (commission) {
      setFormData(commission);
    }
  }, [commission]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{commission ? "Edit Commission" : "New Commission"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Percentage (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.percentage}
              onChange={(e) => handleChange("percentage", parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700">
                {isSubmitting ? "Saving..." : commission ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}