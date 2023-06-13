# Alyra-Testing

## Voting Contract

Allow users to organise a voting process.

## Install 

Please make the following command
```bash
 cd Voting && npm install && npm start
```

## Test
To test, please make the following command:
```bash
 cd Voting && npm test
```

you can add the Gas Reporter: 
```bash
 export REPORT_GAS=1; cd Voting && npm test
```
```
·------------------------------------------|----------------------------|-------------|-----------------------------·
|           Solc version: 0.8.13           ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
···········································|····························|·············|······························
|  Methods                                                                                                          │
·············|·····························|··············|·············|·············|···············|··············
|  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls      ·  eur (avg)  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  addProposal                ·       59076  ·      59172  ·      59106  ·           28  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  addVoter                   ·       50208  ·      50220  ·      50219  ·           43  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30599  ·           20  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30533  ·            7  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  setVote                    ·       60913  ·      78013  ·      74349  ·           14  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      94840  ·           34  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30554  ·           15  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      63565  ·            4  ·          -  │
·············|·····························|··············|·············|·············|···············|··············
|  Deployments                             ·                                          ·  % of limit   ·             │
···········································|··············|·············|·············|···············|··············
|  Voting                                  ·           -  ·          -  ·    1970595  ·        6.6 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|---------------|-------------
```

## Coverage 
To get the coverage, please make the following command:
```bash
 cd Voting && npm run coverage
```

```
A HTML coverage report is available ! 

  Voting
    → Contract
      ✔ should deploy the smart contract
      ✔ should start at RegisteringVoters status
    → getVoter
      ⌊ Voter
        ✔ should get voter from address
        ✔ should failed to get voter from wrong address
      ⌊ Not voter
        ✔ should revert if user is not voter
    → getOneProposal
      ⌊ Voter
        ✔ should get GENESIS proposal as start proposal
        ✔ should get proposal from index
        ✔ should get all the proposals from multiple indices (75ms)
      ⌊ Not voter
        ✔ should revert if user is not voter (53ms)
    → addVoter
      ⌊ Owner
        ⌊ Standard usage
          ✔ should add voter
          ✔ should add multiple voters
          ✔ should emit voter registration event
        ⌊ Failure usage
          ✔ should revert if the status is wrong
          ✔ should revert if the user is already registered
      ⌊ Not owner
        ✔ should revert if user is not owner
    → addProposal
      ⌊ Voter
        ⌊ Standard usage
          ✔ should get GENESIS proposal
          ✔ should registered proposal
          ✔ should emit proposal registration event
          ✔ should registered multiple proposals (69ms)
        ⌊ Failure usage
          ✔ should revert from unregistered voter user
          ✔ should revert from the wrong status
          ✔ should revert from the void proposal
      ⌊ Not voter
        ✔ should revert if user is not voter
    → setVote
      ⌊ Voter
        ⌊ Standard usage
          ✔ should set vote for voter with proposal index
          ✔ should emit vote event for voter with his choice
          ✔ should set Vote to multiples voters with same proposal index (43ms)
        ⌊ Failed usage
          ✔ should revert from the wrong status
          ✔ should revert if the user already vote (68ms)
          ✔ should revert if the user choices an unknown proposal (55ms)
      ⌊ Not voter
        ✔ should revert if user is not voter
    → startProposalsRegistering
      ⌊ Owner
        ⌊ Standard usage
          ✔ should set status to startProposalsRegistering
          ✔ should emit status change from RegisteringVoters to ProposalsRegistrationStarted
          ♦ Special case
            ✔ should add first proposal GENESIS when status changed to startProposalsRegistering
        ⌊ Failure usage
          ✔ should revert if the status is incorrect
      ⌊ Not owner
        ✔ should revert if user is not owner
    → endProposalsRegistering
      ⌊ Owner
        ⌊ Standard usage
          ✔ should set status to endProposalsRegistering
          ✔ should emit status change from ProposalsRegistrationStarted to ProposalsRegistrationEnded
        ⌊ Failure usage
          ✔ should revert if the status is incorrect
      ⌊ Not owner
        ✔ should revert if user is not owner
    → startVotingSession
      ⌊ Owner
        ⌊ Standard usage
          ✔ should set status to VotingSessionStarted
          ✔ should emit status change from ProposalsRegistrationEnded to VotingSessionStarted
        ⌊ Failure usage
          ✔ should revert if the status is incorrect
      ⌊ Not owner
        ✔ should revert if user is not owner
    → endVotingSession
      ⌊ Owner
        ⌊ Standard usage
          ✔ should set status to VotingSessionEnded
          ✔ should emit status change from VotingSessionStarted to VotingSessionEnded
        ⌊ Failure usage
          ✔ should revert if the status is incorrect
      ⌊ Not owner
        ✔ should revert if user is not owner
    → tallyVotes
      ⌊ Owner
        ⌊ Standard usage
          ✔ should set the winning index from proposals votes
          ✔ should emit workflow status change when tally is done
        ⌊ Failure usage
          ✔ should get the first index of proposal if 2 proposals are equal (44ms)
          ✔ should revert if the status is wrong
      ⌊ Not owner
        ✔ should revert if user is not owner


  52 passing (3s)

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  Voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|

```