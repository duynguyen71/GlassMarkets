import { Box, HStack, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

export function SkeletonBox({ h = '18px', w = '100%', borderRadius = 'md', delay = 0, ...props }) {
  const bgGradient = useColorModeValue(
    'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 100%)',
    'linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 100%)'
  )

  return (
    <Box
      h={h}
      w={w}
      borderRadius={borderRadius}
      background={bgGradient}
      backgroundSize='800px 104px'
      animation={`${shimmer} 1.5s infinite linear, ${fadeIn} 0.4s ${delay}s ease-out both`}
      {...props}
    />
  )
}

export function SkeletonRow({ columns = 5 }) {
  return (
    <Box display="flex" gap={4} py={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBox key={i} flex={1} delay={i * 0.1} />
      ))}
    </Box>
  )
}

export function SkeletonCard({ height = '64px', delay = 0 }) {
  const bg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')

  return (
    <Box p={3} borderRadius="xl" bg={bg} animation={`${fadeIn} 0.4s ${delay}s ease-out both`}>
      <SkeletonBox h={height} borderRadius="lg" />
    </Box>
  )
}

// Enhanced skeleton components for the TotalSummaryView
export function SkeletonSummaryCard({ delay = 0, accentColor = null, showProgress = false }) {
  const glassBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')

  return (
    <Box
      p={0}
      borderRadius="xl"
      bg={glassBg}
      animation={`${fadeIn} 0.5s ${delay}s ease-out both`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      {accentColor && <Box h="2" bg={accentColor} borderTopRadius="xl" />}
      <Box p={4} position="relative" minH="150px">
        <Stat>
          <StatLabel>
            <SkeletonBox h="14px" w="120px" mb={2} delay={delay + 0.1} />
          </StatLabel>
          <StatNumber fontWeight="extrabold" mb={1}>
            <SkeletonBox h="28px" w="140px" delay={delay + 0.2} />
          </StatNumber>
          <HStack justify="space-between" mb={1}>
            <SkeletonBox h="20px" w="100px" delay={delay + 0.3} />
            <SkeletonBox h="20px" w="80px" delay={delay + 0.35} />
          </HStack>
          {showProgress && (
            <SkeletonBox h="2px" w="100%" borderRadius="full" mt={2} delay={delay + 0.4} />
          )}
          <StatHelpText>
            <SkeletonBox h="12px" w="150px" mt={2} delay={delay + 0.4} />
          </StatHelpText>
        </Stat>
        <Box position="absolute" top={2} right={3}>
          <SkeletonBox h="32px" w="32px" borderRadius="full" delay={delay + 0.5} />
        </Box>
      </Box>
    </Box>
  )
}

export function SkeletonMarketCapCard({ delay = 0 }) {
  const glassBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')

  return (
    <Box
      p={0}
      borderRadius="xl"
      bg={glassBg}
      animation={`${fadeIn} 0.5s ${delay}s ease-out both`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <Box h="2" bgGradient="linear(to-br, teal.400, green.500)" borderTopRadius="xl" />
      <Box p={4} position="relative" minH="150px">
        <Stat>
          <StatLabel>
            <SkeletonBox h="14px" w="120px" mb={2} delay={delay + 0.1} />
          </StatLabel>
          <HStack justify="space-between" mb={1}>
            <StatNumber fontWeight="extrabold">
              <SkeletonBox h="28px" w="140px" delay={delay + 0.2} />
            </StatNumber>
            <SkeletonBox h="24px" w="100px" delay={delay + 0.3} />
          </HStack>
          <StatHelpText>
            <SkeletonBox h="12px" w="150px" mt={2} delay={delay + 0.4} />
          </StatHelpText>
        </Stat>
        <Box position="absolute" top={2} right={3}>
          <SkeletonBox h="32px" w="32px" borderRadius="full" delay={delay + 0.5} />
        </Box>
      </Box>
    </Box>
  )
}
