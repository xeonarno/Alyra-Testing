
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Voting__factory, Voting } from "../../typechain-types";

describe('Voting', () => {
    let voting: Voting;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addrs: SignerWithAddress[];

    enum StatusMocks {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const contract: Voting__factory = await ethers.getContractFactory('Voting');
        voting = await contract.deploy();

    })

    describe('→ Contract', () => {
        it('should deploy the smart contract', async function () {
            // Act
            const theOwner = await voting.owner();
            // Assert
            expect(owner.address).to.be.equal(theOwner);
        })
        it('should start at RegisteringVoters status', async () => {
            // Arrange 
            const RegisteringVotersStatus = 0;
            // Act
            const status = await voting.workflowStatus();
            // Assert
            expect(status).to.be.equals(RegisteringVotersStatus);
        })
    })

    describe('→ getVoter', () => {
        describe('⌊ Voter', () => {
            it("should get voter from address", async () => {
                // Arrange
                const voterMock = [true, false, BigInt(0)] as Voting.VoterStructOutput;

                await voting.addVoter(owner.address);

                // Act
                const result: Voting.VoterStructOutput = await voting.getVoter(owner);

                // Assert
                expect(result).to.eql(voterMock);
            })

            it("should failed to get voter from wrong address", async () => {
                await expect(
                    // Act
                    voting.getVoter(addr1)
                    // Assert
                ).to.be.revertedWith(
                    "You're not a voter"
                );
            })
        })
        describe('⌊ Not voter', () => {

            it("should revert if user is not voter", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).getVoter(owner)
                    // Assert
                ).to.revertedWith(
                    "You're not a voter"
                )
            })
        })

    })

    describe('→ getOneProposal', () => {
        describe('⌊ Voter', () => {
            beforeEach(async () => {
                await voting.addVoter(owner.address);
                await voting.startProposalsRegistering();
            })

            it("should get GENESIS proposal as start proposal", async () => {
                // Arrange
                const descriptionMock = 'descValue';
                const genesisMock = ['GENESIS', 0n];
                await voting.addProposal(descriptionMock);

                // Act
                const result = await voting.getOneProposal(0);

                // Assert
                expect(result).to.not.eql([descriptionMock, 0n]);
                expect(result).to.eql(genesisMock);
            })

            it("should get proposal from index", async () => {
                // Arrange
                const descriptionMock = 'descValue';
                const proposalMock = [descriptionMock, 0n];
                await voting.addProposal(descriptionMock);

                // Act
                const result = await voting.getOneProposal(1);

                // Assert
                expect(result).to.eql(proposalMock);
            })

            it("should get all the proposals from multiple indices", async () => {
                // Arrange
                const descMock1 = 'descValue1';
                const descMock2 = 'descValue2';
                const descMock3 = 'descValue3';
                const proposalsMock = [["GENESIS", 0n], [descMock1, 0n], [descMock2, 0n], [descMock3, 0n]];
                await voting.addProposal(descMock1);
                await voting.addProposal(descMock2);
                await voting.addProposal(descMock3);

                // Act
                const result1 = await voting.getOneProposal(0);
                const result2 = await voting.getOneProposal(1);
                const result3 = await voting.getOneProposal(2);
                const result4 = await voting.getOneProposal(3);

                // Assert
                expect([result1, result2, result3, result4]).to.eql(proposalsMock);
            })
        })

        describe('⌊ Not voter', () => {
            it("should revert if user is not voter", async () => {
                // Arrange
                const descMock = "descriptionValue";
                await voting.addVoter(owner.address);
                await voting.startProposalsRegistering();
                await voting.addProposal(descMock);

                await expect(
                    // Act
                    voting.connect(addr1).getOneProposal(1)
                    // Assert
                ).to.revertedWith(
                    "You're not a voter"
                )
            })
        })

    })

    describe('→ addVoter', () => {
        describe('⌊ Owner', () => {
            describe('⌊ Standard usage', () => {
                it("should add voter", async () => {

                    // Act
                    await voting.addVoter(owner.address);

                    // Assert
                    const result = await voting.getVoter(owner.address);
                    expect(result).to.eql([true, false, 0n]);
                })

                it("should add multiple voters", async () => {
                    // Arrange
                    const votersMock = [[true, false, 0n], [true, false, 0n]];

                    // Act
                    await voting.addVoter(owner.address);
                    await voting.addVoter(addr1.address);

                    // Assert
                    const result1 = await voting.getVoter(owner.address);
                    const result2 = await voting.getVoter(addr1.address);
                    expect([result1, result2]).to.eql(votersMock);
                })

                it("should emit voter registration event", async () => {
                    await expect(
                        // Act
                        voting.addVoter(owner.address)
                    )
                        // Assert
                        .to.emit(
                            voting,
                            'VoterRegistered'
                        )
                        .withArgs(
                            owner.address,
                        )
                })
            })

            describe('⌊ Failure usage', () => {
                it("should revert if the status is wrong", async () => {
                    // Arrange
                    await voting.startProposalsRegistering();

                    await expect(
                        // Act
                        voting.addVoter(owner.address)
                    )
                        // Assert
                        .to.revertedWith(
                            'Voters registration is not open yet'
                        )
                })
                it("should revert if the user is already registered", async () => {
                    // Arrange
                    await voting.addVoter(owner.address);

                    await expect(
                        // Act
                        voting.addVoter(owner.address)
                    )
                        // Assert
                        .to.revertedWith(
                            'Already registered'
                        )
                })
            });
        })
        describe('⌊ Not owner', () => {
            it("should revert if user is not owner", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).addVoter(addr1.address)
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })

    })

    describe('→ addProposal', () => {

        describe('⌊ Voter', () => {
            describe('⌊ Standard usage', () => {
                beforeEach(async () => {
                    await voting.addVoter(owner.address);
                    await voting.startProposalsRegistering();
                })

                it("should get GENESIS proposal", async () => {
                    // Arrange
                    const descMock = "GENESIS";
                    const voteMock = [descMock, 0n];

                    // Act
                    const result = await voting.getOneProposal(0);

                    // Assert
                    expect(result).to.eql(voteMock);
                })

                it("should registered proposal", async () => {
                    // Arrange
                    const descMock = "descriptionValue";
                    const indexMock = 1;
                    const voteMock = [descMock, 0n];

                    // Act
                    await voting.addProposal(descMock);

                    // Assert
                    const result = await voting.getOneProposal(indexMock);
                    expect(result).to.eql(voteMock);
                })

                it("should emit proposal registration event", async () => {
                    // Arrange
                    const descMock = "descriptionValue";
                    const proposalSize = 1;

                    await expect(
                        // Act
                        voting.addProposal(descMock)
                    )
                        // Assert
                        .to.emit(
                            voting,
                            'ProposalRegistered'
                        )
                        .withArgs(
                            proposalSize,
                        )
                })

                it("should registered multiple proposals", async () => {
                    // Arrange
                    const descBase = "GENESIS";
                    const descMocks = ["descriptionValue1", "descriptionValue2", "descriptionValue3"];
                    const votesMock = [
                        [descBase, 0n],
                        [descMocks[0], 0n],
                        [descMocks[1], 0n],
                        [descMocks[2], 0n],
                    ]

                    // Act
                    await voting.addProposal(descMocks[0]);
                    await voting.addProposal(descMocks[1]);
                    await voting.addProposal(descMocks[2]);

                    // Assert
                    const result1 = await voting.getOneProposal(0);
                    const result2 = await voting.getOneProposal(1);
                    const result3 = await voting.getOneProposal(2);
                    const result4 = await voting.getOneProposal(3);

                    expect([result1, result2, result3, result4]).to.eql(votesMock);
                })
            })

            describe('⌊ Failure usage', () => {

                it('should revert from unregistered voter user', async () => {
                    // Arrange
                    const descMock = 'descriptionValue'; // voluntary

                    await expect(
                        // Act
                        voting.addProposal(descMock)
                    )
                        // Assert
                        .to.revertedWith(
                            "You're not a voter"
                        )
                })

                it('should revert from the wrong status', async () => {
                    // Arrange
                    const descMock = "descriptionValue";
                    await voting.addVoter(owner.address);

                    await expect(
                        // Act
                        voting.addProposal(descMock)
                    )
                        // Assert
                        .to.revertedWith(
                            'Proposals are not allowed yet'
                        )
                })

                it('should revert from the void proposal', async () => {
                    // Arrange
                    const descMock = ''; // voluntary
                    await voting.addVoter(owner.address);
                    await voting.startProposalsRegistering();

                    await expect(
                        // Act
                        voting.addProposal(descMock)
                    )
                        // Assert
                        .to.revertedWith(
                            'Vous ne pouvez pas ne rien proposer'
                        )
                })
            })
        })

        describe('⌊ Not voter', () => {
            it("should revert if user is not voter", async () => {
                // Arrange
                const descMock = "descriptionValue";

                await expect(
                    // Act
                    voting.connect(addr1).addProposal(descMock)
                    // Assert
                ).to.revertedWith(
                    "You're not a voter"
                )
            })
        })
    })

    describe('→ setVote', () => {
        describe('⌊ Voter', () => {

            const descMock1 = "descValue1";
            const descMock2 = "descValue2";

            describe('⌊ Standard usage', () => {
                beforeEach(async () => {
                    await voting.addVoter(owner);
                    await voting.addVoter(addr1);

                    // Add Proposal
                    await voting.startProposalsRegistering();

                    await voting.addProposal(descMock1);
                    await voting.addProposal(descMock2);

                    await voting.endProposalsRegistering();

                    // Start vote
                    await voting.startVotingSession();
                })

                it("should set vote for voter with proposal index", async () => {

                    // Act
                    await voting.setVote(1);

                    // Assert
                    const voter = await voting.getVoter(owner.address);
                    const proposal = await voting.getOneProposal(1);
                    expect(voter).to.eql([true, true, 1n]);
                    expect(proposal).to.eql([descMock1, 1n]);
                })

                it("should emit vote event for voter with his choice", async () => {
                    // Arrange
                    const choice = 1;

                    await expect(
                        // Act
                        voting.setVote(choice)
                        // Assert
                    ).to.emit(voting, 'Voted')
                        .withArgs(owner.address, choice);
                });

                it('should set Vote to multiples voters with same proposal index', async () => {
                    // Act
                    await voting.connect(owner).setVote(1);
                    await voting.connect(addr1).setVote(1);

                    // Assert
                    const voterO = await voting.getVoter(owner.address);
                    const voter1 = await voting.getVoter(addr1.address);

                    const proposal = await voting.getOneProposal(1);
                    expect(voterO).to.eql([true, true, 1n]);
                    expect(voter1).to.eql([true, true, 1n]);
                    expect(proposal).to.eql([descMock1, 2n]);
                })
            })
            describe('⌊ Failed usage', () => {
                it('should revert from the wrong status', async () => {
                    // Arrange 
                    await voting.addVoter(owner);

                    await expect(
                        // Act
                        voting.setVote(1)
                    )
                        // Assert
                        .to.revertedWith(
                            'Voting session havent started yet'
                        )
                })
                it('should revert if the user already vote', async () => {
                    // Arrange
                    await voting.addVoter(owner);
                    await voting.startProposalsRegistering();
                    await voting.addProposal(descMock1);
                    await voting.endProposalsRegistering();
                    await voting.startVotingSession();

                    voting.setVote(1)

                    await expect(
                        // Act
                        voting.setVote(1) // second call
                    )
                        // Assert
                        .to.revertedWith(
                            'You have already voted'
                        )
                })

                it('should revert if the user choices an unknown proposal', async () => {
                    await voting.addVoter(owner);
                    await voting.startProposalsRegistering();
                    await voting.addProposal(descMock1);
                    await voting.endProposalsRegistering();
                    await voting.startVotingSession();

                    await expect(
                        // Act
                        voting.setVote(42)
                    )
                        // Assert
                        .to.revertedWith(
                            'Proposal not found'
                        )
                })
            })
        })

        describe('⌊ Not voter', () => {

            it("should revert if user is not voter", async () => {
                // Arrange
                const voteMock = 1;
                await expect(
                    // Act
                    voting.connect(addr1).setVote(voteMock)
                    // Assert
                ).to.revertedWith(
                    "You're not a voter"
                )
            })
        })
    })

    describe('→ startProposalsRegistering', () => {

        beforeEach(async () => {
            await voting.addVoter(owner.address);
        })

        describe('⌊ Owner', () => {
            describe('⌊ Standard usage', () => {
                it("should set status to startProposalsRegistering", async () => {
                    // Arrange
                    await voting.startProposalsRegistering();

                    // Act
                    const result = await voting.workflowStatus();

                    // Assert
                    expect(result).to.equal(StatusMocks.ProposalsRegistrationStarted);
                })

                it("should emit status change from RegisteringVoters to ProposalsRegistrationStarted", async () => {
                    // Arrange
                    await expect(
                        // Act
                        voting.startProposalsRegistering()
                        // Assert
                    ).to.emit(voting, 'WorkflowStatusChange')
                        .withArgs(StatusMocks.RegisteringVoters, StatusMocks.ProposalsRegistrationStarted);
                })

                describe('♦ Special case', () => {

                    it("should add first proposal GENESIS when status changed to startProposalsRegistering", async () => {
                        // Arrange
                        await voting.startProposalsRegistering();

                        // Act
                        const result = await voting.getOneProposal(0);

                        // Assert
                        expect(result).to.eql(['GENESIS', 0n]);
                    })
                })
            });

            describe('⌊ Failure usage', () => {

                it("should revert if the status is incorrect", async () => {
                    // Arrange
                    // Force Status 
                    await voting.startProposalsRegistering();
                    await voting.endProposalsRegistering();

                    await expect(
                        // Act
                        voting.startProposalsRegistering()
                        // Assert
                    ).to.revertedWith('Registering proposals cant be started now');
                })
            })
        })

        describe('⌊ Not owner', async () => {

            it("should revert if user is not owner", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).startProposalsRegistering()
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })
    })

    describe('→ endProposalsRegistering', () => {

        describe('⌊ Owner', async () => {

            describe('⌊ Standard usage', () => {
                beforeEach(async () => {
                    await voting.startProposalsRegistering();
                })
                it("should set status to endProposalsRegistering", async () => {
                    // Arrange
                    await voting.endProposalsRegistering();

                    // Act
                    const result = await voting.workflowStatus();

                    // Assert
                    expect(result).to.equal(StatusMocks.ProposalsRegistrationEnded);
                })

                it("should emit status change from ProposalsRegistrationStarted to ProposalsRegistrationEnded", async () => {
                    await expect(
                        // Act
                        voting.endProposalsRegistering()
                        // Assert   
                    ).to.emit(voting, 'WorkflowStatusChange')
                        .withArgs(StatusMocks.ProposalsRegistrationStarted, StatusMocks.ProposalsRegistrationEnded);
                })

            });

            describe('⌊ Failure usage', () => {

                it("should revert if the status is incorrect", async () => {
                    await expect(
                        // Act
                        voting.endProposalsRegistering()
                        // Assert
                    ).to.revertedWith('Registering proposals havent started yet');
                })
            })

        });

        describe('⌊ Not owner', async () => {
            beforeEach(async () => {
                await voting.startProposalsRegistering();
            })

            it("should revert if user is not owner", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).endProposalsRegistering()
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })
    })

    describe('→ startVotingSession', () => {

        describe('⌊ Owner', () => {

            describe('⌊ Standard usage', () => {
                beforeEach(async () => {
                    await voting.startProposalsRegistering();
                    await voting.endProposalsRegistering();
                })
                it("should set status to VotingSessionStarted", async () => {
                    // Arrange
                    await voting.startVotingSession();

                    // Act
                    const result = await voting.workflowStatus();

                    // Assert
                    expect(result).to.equal(StatusMocks.VotingSessionStarted);
                })

                it("should emit status change from ProposalsRegistrationEnded to VotingSessionStarted", async () => {
                    await expect(
                        // Act
                        voting.startVotingSession()
                        // Assert
                    ).to.emit(voting, 'WorkflowStatusChange')
                        .withArgs(StatusMocks.ProposalsRegistrationEnded, StatusMocks.VotingSessionStarted);
                })
            });

            describe('⌊ Failure usage', () => {

                it("should revert if the status is incorrect", async () => {
                    await expect(
                        // Act
                        voting.startVotingSession()
                        // Assert
                    ).to.revertedWith('Registering proposals phase is not finished');
                })
            })
        })

        describe('⌊ Not owner', async () => {

            beforeEach(async () => {
                await voting.startProposalsRegistering();
                await voting.endProposalsRegistering();
            })

            it("should revert if user is not owner", async () => {
                await expect(
                    // Act
                    voting.connect(addr1).startVotingSession()
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })
    })

    describe('→ endVotingSession', () => {

        describe('⌊ Owner', async () => {

            describe('⌊ Standard usage', () => {
                beforeEach(async () => {
                    await voting.startProposalsRegistering();
                    await voting.endProposalsRegistering();
                    await voting.startVotingSession();
                })

                it("should set status to VotingSessionEnded", async () => {
                    // Arrange
                    await voting.endVotingSession();

                    // Act
                    const result = await voting.workflowStatus();

                    // Assert
                    expect(result).to.equal(StatusMocks.VotingSessionEnded);
                })

                it("should emit status change from VotingSessionStarted to VotingSessionEnded", async () => {
                    await expect(
                        // Act
                        voting.endVotingSession()
                        // Assert
                    ).to.emit(voting, 'WorkflowStatusChange')
                        .withArgs(StatusMocks.VotingSessionStarted, StatusMocks.VotingSessionEnded);
                })
            });

            describe('⌊ Failure usage', () => {

                it("should revert if the status is incorrect", async () => {
                    await expect(
                        // Act
                        voting.endVotingSession()
                        // Assert
                    ).to.revertedWith('Voting session havent started yet');
                })
            })
        });

        describe('⌊ Not owner', async () => {
            beforeEach(async () => {
                await voting.startProposalsRegistering();
                await voting.endProposalsRegistering();
                await voting.startVotingSession();
            })

            it("should revert if user is not owner", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).endVotingSession()
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })
    })

    describe('→ tallyVotes', () => {
        describe('⌊ Owner', () => {
            const descMock1 = "descValue1";
            const descMock2 = "descValue2";
            beforeEach(async () => {
                // Add Voters
                await voting.addVoter(owner);
                await voting.addVoter(addr1);
                await voting.addVoter(addr2);
                
                // Add Proposal
                await voting.startProposalsRegistering();

                await voting.addProposal(descMock1);
                await voting.addProposal(descMock2);

                await voting.endProposalsRegistering();
            })

            describe('⌊ Standard usage', () => {

                beforeEach(async () => {


                    // Add Votes
                    await voting.startVotingSession();

                    await voting.connect(owner).setVote(1);
                    await voting.connect(addr1).setVote(1);
                    await voting.connect(addr2).setVote(2);

                    await voting.endVotingSession();
                })

                it("should set the winning index from proposals votes", async () => {

                    // Act 
                    await voting.tallyVotes();

                    // Assert
                    const result = await voting.winningProposalID();
                    const proposal = await voting.getOneProposal(result);
                    expect(result).to.equal(1n);
                    expect(proposal).to.eql([descMock1, 2n]);
                })

                it("should emit workflow status change when tally is done", async () => {
                    await expect(
                        // Act
                        voting.tallyVotes()
                    )
                        // Assert
                        .to.emit(
                            voting,
                            'WorkflowStatusChange'
                        ).withArgs(
                            StatusMocks.VotingSessionEnded, StatusMocks.VotesTallied
                        )
                })

            });
            describe('⌊ Failure usage', () => {
                it("should get the first index of proposal if 2 proposals are equal", async () => {
                    // Arrange
                    await voting.startVotingSession();

                    await voting.connect(owner).setVote(1);
                    await voting.connect(addr1).setVote(2);

                    await voting.endVotingSession();

                    // Act
                    await voting.tallyVotes();

                    // Assert
                    const result = await voting.winningProposalID();

                    expect(result).to.equal(1n);

                })

                it("should revert if the status is wrong", async () => {
                    await expect(
                        // Act
                        voting.tallyVotes()
                    )
                        // Assert
                        .to.revertedWith(
                            'Current status is not voting session ended'
                        )
                })
            });

        })

        describe('⌊ Not owner', () => {
            beforeEach(async () => {
                await voting.startProposalsRegistering();
                await voting.endProposalsRegistering();
                await voting.startVotingSession();
                await voting.endVotingSession();
            })
            it("should revert if user is not owner", async () => {
                // Arrange
                await expect(
                    // Act
                    voting.connect(addr1).tallyVotes()
                )
                    // Assert
                    .to.revertedWith(
                        'Ownable: caller is not the owner'
                    )
            })
        })


    })

})