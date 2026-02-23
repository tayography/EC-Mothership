import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ImportLeadsDialog({ open, onOpenChange, onSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, processing, success, error
  const [message, setMessage] = useState("");
  const [importedCount, setImportedCount] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
    } else {
      setFile(null);
      setMessage("Please select a valid CSV file");
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setMessage("Uploading file...");

      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setStatus("processing");
      setMessage("Processing CSV...");

      // Extract data from CSV
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              business_name: { type: "string" },
              phone: { type: "string" }
            }
          }
        }
      });

      if (result.status === "error") {
        setStatus("error");
        setMessage(result.details || "Failed to process CSV file");
        return;
      }

      // Get the leads array from the result
      const leadsData = Array.isArray(result.output) ? result.output : [];
      
      if (leadsData.length === 0) {
        setStatus("error");
        setMessage("No valid leads found in CSV");
        return;
      }

      setMessage("Creating leads...");

      // Create leads in bulk
      await base44.entities.Lead.bulkCreate(leadsData);

      setStatus("success");
      setImportedCount(leadsData.length);
      setMessage(`Successfully imported ${leadsData.length} lead${leadsData.length !== 1 ? 's' : ''}`);
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Failed to import leads");
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setImportedCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-zinc-600">
            Upload a CSV file with columns: <span className="font-mono bg-zinc-100 px-1 rounded">business_name</span> and <span className="font-mono bg-zinc-100 px-1 rounded">phone</span>
          </div>

          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              disabled={status === "uploading" || status === "processing"}
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <Upload className="w-8 h-8 text-zinc-400" />
              <div className="text-sm text-center">
                {file ? (
                  <span className="text-zinc-900 font-medium">{file.name}</span>
                ) : (
                  <>
                    <span className="text-cyan-600 hover:text-cyan-700">Click to upload</span>
                    <span className="text-zinc-500"> or drag and drop</span>
                  </>
                )}
              </div>
              <div className="text-xs text-zinc-400">CSV files only</div>
            </label>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              status === "success" ? "bg-green-50 text-green-700" :
              status === "error" ? "bg-red-50 text-red-700" :
              "bg-blue-50 text-blue-700"
            }`}>
              {status === "uploading" || status === "processing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : status === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : null}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={status === "uploading" || status === "processing"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || status === "uploading" || status === "processing" || status === "success"}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {status === "uploading" || status === "processing" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {status === "uploading" ? "Uploading..." : "Processing..."}
              </>
            ) : (
              "Import Leads"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}