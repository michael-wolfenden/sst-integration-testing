from diagrams import Diagram, Edge, Cluster
from diagrams.generic.device import Mobile

from diagrams.aws.mobile import APIGateway
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.integration import Eventbridge, SimpleQueueServiceSqs

with Diagram("", show=False):
    apiGateway = APIGateway("API Gateway")
    lambdaFn = Lambda("Lambda")
    eventbridge = Eventbridge("Eventbridge")

    with Cluster("Only deployed in test stacks"):
        sqs = SimpleQueueServiceSqs("SQS")
   
    Mobile("Client") >> Edge(label="POST /orders") >> apiGateway
    apiGateway >> Edge(label="place-order") >> lambdaFn
    lambdaFn >> Edge(label="put item") >> Dynamodb("DynamoDB")
    lambdaFn >> Edge(label="publish order-placed") >> eventbridge
    eventbridge >> Edge(label="E2E test queue") >> sqs
