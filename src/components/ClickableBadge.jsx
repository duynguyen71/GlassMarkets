import { Button } from '@chakra-ui/react'

export default function ClickableBadge({ children, onClick, ...props }) {
  return (
    <Button
      onClick={onClick}
      size="xs"
      variant="ghost"
      borderRadius="full"
      px={3}
      height="24px"
      fontWeight="semibold"
      color="inherit"
      bg="transparent"
      _hover={{ bg: 'whiteAlpha.150' }}
      _active={{ bg: 'whiteAlpha.200' }}
      _focus={{ boxShadow: 'none' }}
      _focusVisible={{ boxShadow: 'none' }}
      {...props}
    >
      {children}
    </Button>
  )
}

