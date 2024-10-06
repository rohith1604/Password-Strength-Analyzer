import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Input,
  Progress,
  Text,
  Button,
  HStack,
  Icon,
  useToast,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListIcon,
  Link,
} from "@chakra-ui/react";
import { WarningTwoIcon, CheckCircleIcon, InfoIcon, TimeIcon, LockIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

interface PasswordHistory {
  password: string;
  strength: number;
  date: string;
}

const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];

const PasswordStrengthAnalyzer: React.FC = () => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, feedback: [] });
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [passwordLength, setPasswordLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecialChars, setUseSpecialChars] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('passwordHistory');
    if (storedHistory) {
      setPasswordHistory(JSON.parse(storedHistory));
    }
  }, []);

  const analyzePassword = (pwd: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (pwd.length < 8) {
      feedback.push('Password should be at least 8 characters long.');
    } else {
      score += 20;
    }

    if (!/[A-Z]/.test(pwd)) {
      feedback.push('Include at least one uppercase letter.');
    } else {
      score += 20;
    }

    if (!/[a-z]/.test(pwd)) {
      feedback.push('Include at least one lowercase letter.');
    } else {
      score += 20;
    }

    if (!/\d/.test(pwd)) {
      feedback.push('Include at least one number.');
    } else {
      score += 20;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      feedback.push('Include at least one special character.');
    } else {
      score += 20;
    }

    if (commonPasswords.includes(pwd.toLowerCase())) {
      score = 0;
      feedback.push('This is a commonly used password. Please choose a more unique password.');
    }

    return { score, feedback };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const newStrength = analyzePassword(newPassword);
    setStrength(newStrength);
    updatePasswordHistory(newPassword, newStrength.score);
  };

  const updatePasswordHistory = (pwd: string, strengthScore: number) => {
    const newHistory = [
      { password: pwd, strength: strengthScore, date: new Date().toISOString() },
      ...passwordHistory.slice(0, 4)
    ];
    setPasswordHistory(newHistory);
    localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
  };

  const generatePassword = () => {
    let charset = "";
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";
    if (useSpecialChars) charset += "!@#$%^&*(),.?\":{}|<>";

    let newPassword = "";
    for (let i = 0; i < passwordLength; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    const newStrength = analyzePassword(newPassword);
    setStrength(newStrength);
    updatePasswordHistory(newPassword, newStrength.score);
    
    navigator.clipboard.writeText(newPassword).then(() => {
      toast({
        title: "Password generated and copied!",
        description: "A new strong password has been generated and copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, (err) => {
      console.error('Could not copy password: ', err);
    });
  };

  const estimateCrackTime = (score: number): string => {
    if (score < 20) return "Less than a second";
    if (score < 40) return "A few hours";
    if (score < 60) return "A few days";
    if (score < 80) return "A few months";
    return "Several years";
  };

  const calculateEntropy = (pwd: string): number => {
    const charset = (pwd.match(/[a-z]/) ? 26 : 0) +
                    (pwd.match(/[A-Z]/) ? 26 : 0) +
                    (pwd.match(/[0-9]/) ? 10 : 0) +
                    (pwd.match(/[^a-zA-Z0-9]/) ? 33 : 0);
    return Math.log2(Math.pow(charset, pwd.length));
  };

  return (
    <VStack spacing={4} align="stretch" width="100%" maxWidth="600px" margin="auto">
      <Heading as="h1" size="xl" textAlign="center">
        Password Strength Analyzer
      </Heading>
      <Input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={handlePasswordChange}
      />
      <Progress value={strength.score} colorScheme={strength.score < 60 ? "red" : strength.score < 100 ? "yellow" : "green"} />
      <HStack>
        <Icon
          as={strength.score < 60 ? WarningTwoIcon : strength.score < 100 ? InfoIcon : CheckCircleIcon}
          color={strength.score < 60 ? "red.500" : strength.score < 100 ? "yellow.500" : "green.500"}
        />
        <Text fontWeight="bold" color={strength.score < 60 ? "red.500" : strength.score < 100 ? "yellow.500" : "green.500"}>
          {strength.score < 60 ? 'Weak' : strength.score < 100 ? 'Moderate' : 'Strong'}
        </Text>
      </HStack>
      {strength.feedback.length > 0 && (
        <VStack align="start" spacing={1}>
          {strength.feedback.map((item, index) => (
            <Text key={index} fontSize="sm" color="gray.600">
              • {item}
            </Text>
          ))}
        </VStack>
      )}
      <Box>
        <Text fontSize="sm">Estimated time to crack: {estimateCrackTime(strength.score)}</Text>
        <Text fontSize="sm">Password entropy: {calculateEntropy(password).toFixed(2)} bits</Text>
      </Box>
      <Box>
        <Heading as="h3" size="md" mb={2}>Password Generator</Heading>
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel htmlFor="password-length" mb="0">
            Password Length: {passwordLength}
          </FormLabel>
          <Slider
            id="password-length"
            min={8}
            max={32}
            value={passwordLength}
            onChange={(val) => setPasswordLength(val)}
            flex={1}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>
        <HStack spacing={4} mb={2}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="use-uppercase" mb="0">
              A-Z
            </FormLabel>
            <Switch id="use-uppercase" isChecked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="use-lowercase" mb="0">
              a-z
            </FormLabel>
            <Switch id="use-lowercase" isChecked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="use-numbers" mb="0">
              0-9
            </FormLabel>
            <Switch id="use-numbers" isChecked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="use-special-chars" mb="0">
              !@#
            </FormLabel>
            <Switch id="use-special-chars" isChecked={useSpecialChars} onChange={(e) => setUseSpecialChars(e.target.checked)} />
          </FormControl>
        </HStack>
        <Button onClick={generatePassword} colorScheme="green" width="100%">
          Generate Strong Password
        </Button>
      </Box>
      <Box>
        <Heading as="h3" size="md" mb={2}>Password History</Heading>
        <List spacing={3}>
          {passwordHistory.map((item, index) => (
            <ListItem key={index}>
              <HStack>
                <ListIcon as={StarIcon} color={item.strength < 60 ? "red.500" : item.strength < 100 ? "yellow.500" : "green.500"} />
                <Text>Strength: {item.strength}</Text>
                <Text>Date: {new Date(item.date).toLocaleString()}</Text>
              </HStack>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Heading as="h3" size="md" mb={2}>Password Security Tips</Heading>
        <List spacing={3}>
          <ListItem>
            <ListIcon as={LockIcon} color="green.500" />
            Use a unique password for each account
          </ListItem>
          <ListItem>
            <ListIcon as={RepeatIcon} color="green.500" />
            Change your passwords regularly
          </ListItem>
          <ListItem>
            <ListIcon as={TimeIcon} color="green.500" />
            Use two-factor authentication when available
          </ListItem>
        </List>
      </Box>
      <Box>
        <Heading as="h3" size="md" mb={2}>Password Manager Recommendation</Heading>
        <Text>
          Consider using a password manager to securely store and generate strong, unique passwords for all your accounts. 
          Some popular options include:
        </Text>
        <List spacing={3} mt={2}>
          <ListItem>
            <Link href="https://www.lastpass.com/" isExternal color="blue.500">LastPass</Link>
          </ListItem>
          <ListItem>
            <Link href="https://1password.com/" isExternal color="blue.500">1Password</Link>
          </ListItem>
          <ListItem>
            <Link href="https://bitwarden.com/" isExternal color="blue.500">Bitwarden</Link>
          </ListItem>
        </List>
      </Box>
    </VStack>
  );
};

export default PasswordStrengthAnalyzer;