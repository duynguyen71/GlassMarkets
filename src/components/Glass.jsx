import { Box, useColorModeValue } from '@chakra-ui/react'

export default function Glass({ children, hoverLift = false, ...props }) {
  const bg = useColorModeValue('rgba(255,255,255,0.60)', 'rgba(17,25,40,0.60)')
  const border = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.14)')
  return (
    <Box
      position="relative"
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="2xl"
      boxShadow="0 12px 40px rgba(0,0,0,0.35)"
      backdropFilter="blur(16px) saturate(140%) contrast(105%)"
      userSelect="none"
      sx={{ WebkitBackdropFilter: 'blur(16px) saturate(140%) contrast(105%)', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={hoverLift ? { transform: 'translateY(-2px) scale(1.01)', boxShadow: '0 16px 44px rgba(0,0,0,0.4)' } : undefined}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bgGradient: 'linear(to-br, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 40%, transparent)',
        opacity: 0.25,
        pointerEvents: 'none',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)',
        pointerEvents: 'none',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
