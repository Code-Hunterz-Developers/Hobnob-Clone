import React from 'react';
import { toast } from 'sonner';
import { Upload, Download, Loader2, CheckCircle2, XCircle, RotateCcw, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { parseCsvFile, downloadCsvTemplate } from '@/lib/csv';

export interface BulkUploadColumn {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
}

interface ParsedRow<T> {
  rowNumber: number;
  label: string;
  data?: T;
  error?: string;
}

interface BulkUploadDialogProps<T> {
  entityLabel: string;
  triggerLabel?: string;
  columns: BulkUploadColumn[];
  templateFilename: string;
  templateExampleRow: string[];
  /** Raw CSV column holding the filename of an image uploaded in step 2. */
  imageColumnKey: string;
  parseRow: (raw: Record<string, string>, imageFile: File | undefined) => T;
  getRowLabel: (raw: Record<string, string>) => string;
  createRow: (data: T) => Promise<void>;
  onComplete: () => void;
}

export function BulkUploadDialog<T>({
  entityLabel,
  triggerLabel = 'Bulk Upload',
  columns,
  templateFilename,
  templateExampleRow,
  imageColumnKey,
  parseRow,
  getRowLabel,
  createRow,
  onComplete,
}: BulkUploadDialogProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [rawRows, setRawRows] = React.useState<Record<string, string>[] | null>(null);
  const [imageFiles, setImageFiles] = React.useState<Map<string, File>>(new Map());
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<{ success: number; failed: number } | null>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const imagesInputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setRawRows(null);
    setImageFiles(new Map());
    setImporting(false);
    setProgress(0);
    setResult(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const handleCsvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await parseCsvFile(file);
      if (raw.length === 0) {
        toast.error('That CSV had no rows to import.');
        return;
      }
      setRawRows(raw);
    } catch {
      toast.error('Could not read that file. Make sure it is a valid CSV.');
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const map = new Map<string, File>();
    for (const file of Array.from(files)) {
      map.set(file.name.toLowerCase(), file);
    }
    setImageFiles(map);
  };

  const rows = React.useMemo<ParsedRow<T>[] | null>(() => {
    if (!rawRows) return null;
    return rawRows.map((raw, i) => {
      const rowNumber = i + 2; // account for header row
      const label = getRowLabel(raw) || `Row ${rowNumber}`;
      const imageRef = raw[imageColumnKey]?.trim();
      let imageFile: File | undefined;
      if (imageRef) {
        imageFile = imageFiles.get(imageRef.toLowerCase());
        if (!imageFile) {
          return { rowNumber, label, error: `Image "${imageRef}" was not uploaded in step 2` };
        }
      }
      try {
        const data = parseRow(raw, imageFile);
        return { rowNumber, label, data };
      } catch (err) {
        return { rowNumber, label, error: err instanceof Error ? err.message : 'Invalid row' };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawRows, imageFiles]);

  const validRows = rows?.filter((r) => r.data) ?? [];
  const invalidRows = rows?.filter((r) => r.error) ?? [];

  const handleImport = async () => {
    if (!rows) return;
    setImporting(true);
    let success = 0;
    let failed = invalidRows.length;

    for (const row of rows) {
      if (!row.data) continue;
      try {
        await createRow(row.data);
        success += 1;
      } catch {
        failed += 1;
      }
      setProgress(Math.round(((success + failed) / rows.length) * 100));
    }

    setResult({ success, failed });
    setImporting(false);
    onComplete();
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid={`button-bulk-upload-${entityLabel.toLowerCase().replace(/\s+/g, '-')}`}>
          <Upload className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload {entityLabel}</DialogTitle>
        </DialogHeader>

        {!rawRows && !result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium mb-2">CSV columns</p>
              <ul className="space-y-1 text-foreground/80">
                {columns.map((col) => (
                  <li key={col.key}>
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{col.key}</span>
                    {col.required ? <span className="text-destructive"> *</span> : null}
                    {col.hint ? <span className="text-muted-foreground"> — {col.hint}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadCsvTemplate(templateFilename, columns.map((c) => c.key), templateExampleRow)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <div className="space-y-2">
              <p className="text-sm font-medium">Step 1: Upload CSV</p>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
                data-testid="input-bulk-upload-file"
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>
        ) : null}

        {rawRows && !result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> Step 2: Upload matching images
              </p>
              <p className="text-xs text-muted-foreground">
                Select every image referenced in the "{imageColumnKey}" column. Each row is matched by exact filename.
              </p>
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                data-testid="input-bulk-upload-images"
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {imageFiles.size > 0 ? (
                <p className="text-xs text-muted-foreground">{imageFiles.size} image(s) ready.</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{validRows.length} valid</Badge>
              {invalidRows.length > 0 ? (
                <Badge variant="destructive">{invalidRows.length} with errors</Badge>
              ) : null}
              <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={reset} disabled={importing}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Start over
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {rows!.map((row) => (
                    <tr key={row.rowNumber} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2 text-foreground/80 whitespace-nowrap">Row {row.rowNumber}</td>
                      <td className="px-3 py-2 font-medium text-foreground truncate max-w-[160px]">{row.label}</td>
                      <td className="px-3 py-2 text-right">
                        {row.error ? (
                          <span className="inline-flex items-center gap-1 text-destructive text-xs">
                            <XCircle className="w-3.5 h-3.5" /> {row.error}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-foreground/70">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importing ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">Importing... {progress}%</p>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                data-testid="button-confirm-bulk-upload"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Import ${validRows.length} ${entityLabel}`}
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm space-y-1">
              <p className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" /> {result.success} imported successfully
              </p>
              {result.failed > 0 ? (
                <p className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-4 h-4" /> {result.failed} skipped due to errors
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose} data-testid="button-close-bulk-upload">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
