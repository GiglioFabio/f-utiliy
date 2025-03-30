import { MenuItem } from '../interfaces';

type Props = {
  selected: MenuItem;
};

export default function ContentArea({ selected }: Props) {
  return (
    <div className='flex-1 p-2 space-y-6'>
      <h2 className='text-xl font-semibold'>{selected.header}</h2>

      {selected.content}
    </div>
  );
}
