import { ArrowUpIcon } from '@chakra-ui/icons'
import { IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollPosition from '../hooks/useScrollPosition'

const MotionIconButton = motion(IconButton)

export default function ScrollToTop() {
  const showButton = useScrollPosition(300)
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {showButton && (
        <Tooltip label="Scroll to top" placement="left">
          <MotionIconButton
            aria-label="Scroll to top"
            icon={<ArrowUpIcon />}
            onClick={scrollToTop}
            position="fixed"
            bottom={{ base: 4, md: 8 }}
            right={{ base: 4, md: 8 }}
            size="lg"
            borderRadius="full"
            colorScheme="blue"
            boxShadow="lg"
            zIndex={999}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            _hover={{
              boxShadow: 'xl',
            }}
          />
        </Tooltip>
      )}
    </AnimatePresence>
  )
}
