import { Button } from '@/components/ui/button';
import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface DataTablePaginationProps {
  table: Table<any>;
}

const TablePagination = ({ table }: DataTablePaginationProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-default-100">
      <div className="flex-1 text-xs font-bold text-default-500 uppercase tracking-widest">
        Showing {table.getFilteredRowModel().rows.length} record(s)
      </div>
      <div className="flex items-center gap-1 md:gap-2 flex-none">
        <Button
          variant="outline"
          color="secondary"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className='w-8 h-8'
        >
          <ChevronLeft className='w-4 h-4' />
        </Button>
        {table.getPageOptions().map((page, pageIndex) => (
          <Button
            key={`basic-data-table-${pageIndex}`}
            onClick={() => table.setPageIndex(pageIndex)}
            size="icon"
            color={table.getState().pagination.pageIndex === pageIndex ? 'primary' : 'secondary'}
            variant={table.getState().pagination.pageIndex === pageIndex ? 'default' : 'outline'}
            className="w-8 h-8 font-bold"
          >
            {page + 1}
          </Button>

        ))}
        <Button
          variant="outline"
          color="secondary"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className='w-8 h-8'
        >
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;