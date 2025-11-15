import { Box } from '@chakra-ui/react'

export default function IconCircle({ children, size = 8, color, bg }) {
  return (
    <Box
      w={size}
      h={size}
      borderRadius="full"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      bg={bg || 'whiteAlpha.300'}
      color={color || 'whiteAlpha.900'}
      boxShadow="0 4px 14px rgba(0,0,0,0.25)"
      backdropFilter="blur(6px) saturate(120%)"
    >
      {children}
    </Box>
  )
}

