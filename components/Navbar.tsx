// components/Navbar.tsx
"use client"; // Ensure client-side for Chakra hooks (if not already)

import { Box, Button, Flex, IconButton, useDisclosure } from '@chakra-ui/react';
import { Menu, X } from 'lucide-react'; // Replace with your icons (e.g., Menu for hamburger, X for close)
import { Icon } from '@chakra-ui/react'; // Chakra's wrapper for custom icons

// Optional: If using React Icons instead
// import { MdMenu, MdClose } from 'react-icons/md';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box as="nav" bg="background" p={4} shadow="sm">
      <Flex align="center" justify="space-between">
        {/* Logo/Title */}
        <Box fontWeight="bold">Project Picker</Box>

        {/* Desktop Menu */}
        <Flex display={{ base: 'none', md: 'flex' }} gap={4}>
            <a href="/"><Button variant="ghost">Home</Button></a>
            <a href="/projects"><Button variant="ghost">Project</Button></a>
            <a href="/about"><Button variant="ghost">About</Button></a>

          {/* Add more links */}
        </Flex>

        {/* Mobile Toggle Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Toggle Menu"
          icon={
            <Icon as={isOpen ? X : Menu} boxSize={6} /> // Use Lucide icons via Chakra's Icon
          }
          onClick={onToggle}
          variant="ghost"
        />

        {/* Mobile Menu (Drawer or Dropdown) */}
        {isOpen && (
          <Flex
            display={{ base: 'flex', md: 'none' }}
            flexDir="column"
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="background"
            p={4}
            shadow="md"
            gap={2}
          >
            <Button variant="ghost" onClick={onToggle}>Home</Button>
            <Button variant="ghost" onClick={onToggle}>Project</Button>
            <Button variant="ghost" onClick={onToggle}>About</Button>

          </Flex>
        )}
      </Flex>
    </Box>
  );
}