import { Box, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`

export function SkeletonBox({ h = '18px', w = '100%', borderRadius = 'md', ...props }) {
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
      animation={`${shimmer} 1.5s infinite linear`}
      {...props}
    />
  )
}

export function SkeletonRow({ columns = 5 }) {
  return (
    <Box display="flex" gap={4} py={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBox key={i} flex={1} />
      ))}
    </Box>
  )
}

export function SkeletonCard({ height = '64px' }) {
  const bg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')

  return (
    <Box p={3} borderRadius="xl" bg={bg}>
      <SkeletonBox h={height} borderRadius="lg" />
    </Box>
  )
}
