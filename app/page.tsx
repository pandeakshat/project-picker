"use client";

import { useState, useEffect, useRef } from "react";
import {
  AbsoluteCenter,
  Badge,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Image,
  ProgressCircle,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

interface Project {
  id: number;
  name: string;
  priority: number;
  difficulty: number;
  pomodoro_count: number;
  image_url?: string | null;
}

export default function ProjectPicker() {
  const [pickedProject, setPickedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [pomodoroDuration, setPomodoroDuration] = useState<number>(25); // minutes
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects/all");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        // Map to Project interface (strip extra fields)
        const projects: Project[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          priority: p.priority,
          difficulty: p.difficulty,
          pomodoro_count: p.pomodoro_count,
          image_url: p.image_url,
        }));
        setAllProjects(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Pick random project - existing functionality
  async function pickProject() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects/pick");
      if (res.ok) {
        const project = await res.json();
        setPickedProject(project);
        setTimeLeft(null);
      }
    } catch (error) {
      console.error("Error picking project:", error);
    }
    setLoading(false);
  }

  // Select a project from cards
  function selectProject(project: Project) {
    setPickedProject(project);
    setTimeLeft(null);
  }

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      completePomodoro();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  async function completePomodoro() {
    if (!pickedProject) return;

    try {
      await fetch(`/api/projects/${pickedProject.id}/increment-pomodoro`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error completing pomodoro:", error);
    }

    setPickedProject(null);
    setTimeLeft(null);
  }

  function startTimer(durationMinutes: number) {
    setPomodoroDuration(durationMinutes);
    setTimeLeft(durationMinutes * 60);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const progressValue =
    timeLeft !== null ? (timeLeft / (pomodoroDuration * 60)) * 100 : 100;

  // Project card component
  function ProjectCard({ project }: { project: Project }) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p="6"
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
        maxW="sm"
        bg="white"
        _dark={{ bg: "gray.700" }}
        textAlign="center"
      >
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.name || "Project image"}
            boxSize="150px"
            objectFit="cover"
            mx="auto"
            borderRadius="md"
          />
        ) : (
          <Box
            boxSize="150px"
            bg="gray.200"
            _dark={{ bg: "gray.600" }}
            mx="auto"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.500"
            fontSize="sm"
          >
            No Image
          </Box>
        )}

        <Heading mt="4" size="md">
          {project.name}
        </Heading>

        <Badge colorScheme="purple" mt="2" display="block">
          Priority: {project.priority}
        </Badge>

        <Badge colorScheme="green" mt="2" display="block">
          Difficulty: {project.difficulty}
        </Badge>

        <Text mt="2" color="gray.600" _dark={{ color: "gray.300" }}>
          Pomodoros completed: {project.pomodoro_count}
        </Text>

        <Button
          mt="4"
          colorScheme="teal"
          onClick={() => selectProject(project)}
          size="sm"
          w="full"
        >
          Choose This Project
        </Button>
      </Box>
    );
  }

  if (pickedProject && timeLeft === null) {
    // Show project details and timer buttons when project selected but timer not started
    return (
      <Box p={4} maxW="md" mx="auto" textAlign="center">
        <Button
          colorScheme="gray"
          onClick={() => {
            setPickedProject(null);
          }}
          mb={4}
        >
          Back to Projects
        </Button>

        <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="xl" mb={2}>
            {pickedProject.name}
          </Text>
          <Text>Priority: {pickedProject.priority}</Text>
          <Text>Difficulty: {pickedProject.difficulty}</Text>
          <Text>Pomodoros done: {pickedProject.pomodoro_count}</Text>

          <VStack mt={6} spacing={4}>
            <Text>Select Pomodoro Duration</Text>
            <HStack spacing={4}>
              {[1, 25, 45, 75].map((duration) => (
                <Button
                  key={duration}
                  onClick={() => startTimer(duration)}
                  colorScheme="teal"
                >
                  {duration} min
                </Button>
              ))}
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (pickedProject && timeLeft !== null) {
    // Show timer when running
    return (
      <Box p={4} maxW="md" mx="auto" textAlign="center">
        <Button
          colorScheme="gray"
          onClick={() => {
            setPickedProject(null);
            setTimeLeft(null);
          }}
          mb={4}
        >
          Back to Projects
        </Button>

        <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="xl" mb={2}>
            {pickedProject.name}
          </Text>
          <Text>Priority: {pickedProject.priority}</Text>
          <Text>Difficulty: {pickedProject.difficulty}</Text>
          <Text>Pomodoros done: {pickedProject.pomodoro_count}</Text>

          <VStack mt={6} spacing={4}>
            <ProgressCircle.Root
              value={progressValue / 100}
              colorPalette="teal"
              size="160px"
            >
              <ProgressCircle.Circle css={{ "--thickness": "8px" }}>
                <ProgressCircle.Track />
                <ProgressCircle.Range stroke="teal.400" />
              </ProgressCircle.Circle>
              <AbsoluteCenter>
                <ProgressCircle.ValueText fontSize="2xl" fontWeight="bold">
                  {formatTime(timeLeft)}
                </ProgressCircle.ValueText>
              </AbsoluteCenter>
            </ProgressCircle.Root>
            <Button colorScheme="red" onClick={() => setTimeLeft(null)}>
              Stop Timer
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Show cards when no project selected
  return (
    <Box p={6} bg="gray.50" _dark={{ bg: "gray.800" }} minHeight="80vh">
      <HStack spacing={4} mb={6} justify="center">
        <Button colorScheme="teal" onClick={pickProject} isLoading={loading}>
          Pick Next Project
        </Button>
      </HStack>

      <Heading mb="6" textAlign="center" color="teal.500">
        Choose a Project
      </Heading>

      {projectsLoading ? (
        <Center minHeight="60vh">
          <Spinner size="xl" />
        </Center>
      ) : allProjects.length === 0 ? (
        <Text textAlign="center" color="gray.500" _dark={{ color: "gray.400" }}>
          No projects found.
        </Text>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing="6">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}