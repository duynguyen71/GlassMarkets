import { Box, useColorModeValue } from '@chakra-ui/react'

export default function Background() {
  const bgBase = useColorModeValue('#edf2f7', '#0b1020')
  const blob1 = useColorModeValue('#90cdf4', '#3b82f6')
  const blob2 = useColorModeValue('#fbb6ce', '#ec4899')
  const blob3 = useColorModeValue('#c6f6d5', '#22c55e')
  const grainOpacity = useColorModeValue(0.05, 0.08)
  return (
    <Box position="fixed" inset={0} zIndex={-2} bg={bgBase}>
      <Box
        position="absolute"
        w="60vmax"
        h="60vmax"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.25}
        bgGradient={`radial(${blob1}, transparent 60%)`}
        top="-10vmax"
        left="-10vmax"
      />
      <Box
        position="absolute"
        w="55vmax"
        h="55vmax"
        borderRadius="full"
        filter="blur(90px)"
        opacity={0.22}
        bgGradient={`radial(${blob2}, transparent 60%)`}
        bottom="-10vmax"
        right="-5vmax"
      />
      <Box
        position="absolute"
        w="40vmax"
        h="40vmax"
        borderRadius="full"
        filter="blur(70px)"
        opacity={0.18}
        bgGradient={`radial(${blob3}, transparent 60%)`}
        top="20vh"
        right="40vw"
      />
      <Box position="absolute" inset={0} bgGradient="linear(115deg, transparent, rgba(0,0,0,0.25))" />
      {/* subtle grain to enhance glass feel */}
      <Box
        position="absolute"
        inset={0}
        opacity={grainOpacity}
        bgImage="radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)"
        bgSize="4px 4px"
        pointerEvents="none"
      />
    </Box>
  )
}
