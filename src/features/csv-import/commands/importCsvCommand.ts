import { ImportOptions } from '../../../core/domain/interfaces/importers';

export interface ImportCsvCommand {
  filePath: string;
  options: ImportOptions;
}