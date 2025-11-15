import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay } from '@chakra-ui/react'
import SideNav from './SideNav'

export default function MobileNav({ isOpen, onClose, active, onChange }) {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="rgba(17,25,40,0.75)" backdropFilter="blur(12px) saturate(120%)">
        <DrawerHeader>Navigate</DrawerHeader>
        <DrawerBody>
          <SideNav active={active} onChange={(k) => { onChange(k); onClose() }} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

