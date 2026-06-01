import { Button, Dialog, Text } from '@radix-ui/themes';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  desc: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  desc,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Dialog.Root
      open={open}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>
          { title }
        </Dialog.Title>
        <Text as="div" size="2" mb="1" weight="bold">
          { desc }
        </Text>

        <div className="flex gap-3 mt-2 justify-end">
          <Button type="button" onClick={onCancel} variant="soft" color="gray">
            No
          </Button>

          <Button type="button" onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
